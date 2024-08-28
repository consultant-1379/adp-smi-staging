load('config.star', 'get_settings')
load('ext://namespace', 'namespace_inject')
settings = get_settings()
docker_registries = settings.get('dockerRegistries')
armdocker = docker_registries['armdocker']

additional_values = settings.get('additionalGasValues')
gas_image_name= settings.get('gasImageName')
gas_version = settings.get('gasVersion')
gas_repo_name = settings.get('gasRepo')
repo_username = os.environ['ARM_USER_SELI']
repo_password = os.environ['ARM_TOKEN_SELI']
gas_image_destination = settings.get('gasImageTempFolder')
mTLS = settings.get('mTLS')
iamNeeded = settings.get('enableAuthentication')

def deploy_gas(gas_ingressHost, namespace):
  local('rm -rf ' + gas_image_destination)
  local('mkdir ' + gas_image_destination)
  local('helm pull ' + gas_image_name + \
    ' --version ' + gas_version +\
    ' --repo '+ gas_repo_name +\
    ' --username '+ repo_username +\
    ' --password '+ repo_password +\
    ' --destination ' + gas_image_destination)


  k8s_resource('eric-adp-gui-aggregator-service', # deployment name in the k8s yaml
    resource_deps=['tilt-iccr-ip-fetcher']
  )

  gas_params = [ # Values to set from the command-line
      'global.pullSecret=' + armdocker['secretName'],
      'ingress.enabled=true',
      'ingress.useContour=true',
      'metrics.enabled=false',
      'ingress.hostname='+gas_ingressHost,
      'ingress.cors.allowOrigin=*'
  ]

  if mTLS:
    gas_params.append('service.endpoints.http.tls.verifyClientCertificate=optional')
  else:
    gas_params.append('global.security.tls.enabled=false')
    gas_params.append('ingress.tls.enabled=false')

  if iamNeeded:
    authFqdn = ''.join(['authn.iam.', gas_ingressHost])
    keycloakFqdn = ''.join(['iam.', gas_ingressHost])
    gas_params.append('authorizationProxy.enabled='+str(iamNeeded))
    gas_params.append('authorizationProxy.authnProxyFQDN='+authFqdn)
    gas_params.append('authorizationProxy.keycloakFQDN='+keycloakFqdn)
    gas_params.append('authorizationProxy.adpIccrServiceName=eric-eea-ingress-ctrl-common')
    gas_params.append('configuration.userPermission.enabled='+str(iamNeeded))

  template_params = []
  template_params.append('gui-aggregator-service')  # release (deployment) name
  template_params.append(gas_image_destination + '/' + gas_image_name + '-' + gas_version + '.tgz')
  template_params.append('--include-crds ')
  template_params.append('--namespace '+ namespace)
  for valuesFile in additional_values:
    template_params.append('--values ' + valuesFile)
  template_params.append('--set ' + ','.join(gas_params))

  # adding custom Capabilities.APIVersions to support given K8s server version
  customApiVersions = settings.get('customK8sApiVersions', [])
  for version in customApiVersions:
    template_params.append('--api-versions ' + version)

  gas_yaml = local('helm template ' + ' '.join(template_params), quiet=True)
  k8s_yaml(namespace_inject(gas_yaml, namespace), allow_duplicates=True)
  local('rm -rf ' + gas_image_destination)
