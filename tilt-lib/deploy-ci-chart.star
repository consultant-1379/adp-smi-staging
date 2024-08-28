load('config.star', 'get_settings')
load('ext://namespace', 'namespace_inject')
settings = get_settings()
docker_registries = settings.get('dockerRegistries')
armdocker = docker_registries['armdocker']

additional_values = settings.get('additionalCiValues')
mTLS = settings.get('mTLS')
iamNeeded = settings.get('enableAuthentication')

def deploy_ci_chart(ha_ingressHost, gas_ingressHost, uis_ingressHost, dst_ingressHost, loadBalancerIp, namespace):

  k8s_resource('eric-oss-help-aggregator', # deployment name in the k8s yaml
    resource_deps=['tilt-iccr-ip-fetcher']
  )

  ci_params = [ # Values to set from the command-line
      'global.pullSecret='+armdocker['secretName'],

      'eric-oss-help-aggregator.ingress.hostname='+ha_ingressHost,
      'eric-oss-help-aggregator.uiconfig.hostname='+ha_ingressHost,
      'eric-oss-help-aggregator.uiconfig.path=/',
      'eric-oss-help-aggregator.service.endpoints.http.tls.verifyClientCertificate=optional',
      'eric-oss-help-aggregator.service.corsOrigin=*',
      'eric-oss-help-aggregator.ingress.cors.allowOrigin=*',

      'eric-oss-ui-settings.ingress.hostname='+uis_ingressHost,
      'eric-dst-query.ingress.hostname='+dst_ingressHost,
  ]

  if mTLS:
    ci_params.append('eric-oss-help-aggregator.uiconfig.protocol=https')
    ci_params.append('eric-oss-help-aggregator.ingress.tls.enabled=true')
    ci_params.append('eric-oss-help-aggregator.ingress.tls.passthrough=true')
  else:
    ci_params.append('global.security.tls.enabled=false')
    ci_params.append('eric-oss-help-aggregator.uiconfig.protocol=http')
    ci_params.append('eric-oss-help-aggregator.ingress.tls.enabled=false')
    ci_params.append('eric-sec-sip-tls.enabled=false')

  if iamNeeded:
    iamAuthFqdn = ''.join(['authn.iam.', gas_ingressHost])
    iamKeycloakFqdn = ''.join(['iam.', gas_ingressHost])
    ci_params.append('eric-sec-access-mgmt.enabled=true')
    ci_params.append('eric-data-document-database-iam.enabled=true')
    ci_params.append('eric-sec-access-mgmt.authenticationProxy.ingress.hostname=' + iamAuthFqdn)
    ci_params.append('eric-sec-access-mgmt.authenticationProxy.cookieDomain=nip.io')
    ci_params.append('eric-sec-access-mgmt.ingress.hostname='+iamKeycloakFqdn)
    if settings.get('iamUserName') and settings.get('iamUserPassword'):
      ci_params.append('eric-sec-access-mgmt.adpIamUserName='+str(settings.get('iamUserName')))
      ci_params.append('eric-sec-access-mgmt.adpIamUserPwd=' + str(settings.get('iamUserPassword')))
    local_resource(
      'create-iam-realm',
      'node ci/scripts/keycloak-rest.js',
      resource_deps=['eric-sec-access-mgmt'],
      env={
        'NAMESPACE': namespace,
        'HOSTNAME': iamKeycloakFqdn,
        'REALM': 'oam',
        'ADMIN_PASSWORD': '4dm1N_login_pwd',
        'SET_ROLE': 'false'
      }
    )
    local_resource(
      'set-iam-role',
      'node ci/scripts/keycloak-rest.js',
      resource_deps=['eric-adp-gui-aggregator-service'],
      env={
        'NAMESPACE': namespace,
        'HOSTNAME': iamKeycloakFqdn,
        'REALM': 'oam',
        'ADMIN_PASSWORD': '4dm1N_login_pwd',
        'SET_ROLE': 'true'
      }
    )

  # generate yaml with 'helm template' enriched with values and extra config
  template_params = []
  template_params.append('ci')  # release (deployment) name
  template_params.append('charts/ci')  # charts folder
  template_params.append('--include-crds ')
  template_params.append('--namespace '+ namespace)
  for valuesFile in additional_values:
    if valuesFile:
      template_params.append('--values ' + valuesFile)
  template_params.append('--set ' + ','.join(ci_params))

  # adding custom Capabilities.APIVersions to support given K8s server version
  customApiVersions = settings.get('customK8sApiVersions', [])
  for version in customApiVersions:
    template_params.append('--api-versions ' + version)

  # Switch quiet parameter of local() function to see full command in tilt console
  ci_yaml = local('helm template ' + ' '.join(template_params), quiet=True)

  # deploy yaml and watch chart folder
  k8s_yaml(namespace_inject(ci_yaml, namespace), allow_duplicates=True)

  cmd = 'kubectl -n ${NAMESPACE} get service -o=jsonpath=\'{.items[?(@.spec.type == "LoadBalancer")].status.loadBalancer.ingress[0].ip}\' \
    > tilt.iccr.ip.txt && \
    if ! [ -s "tilt.iccr.ip.txt" ]; then echo "ERROR: No Loadbalancer IP!" && exit 1; else echo "ICCR address in ${NAMESPACE} namespace:" && cat tilt.iccr.ip.txt && echo "\\n";fi'
  local_resource(
    'tilt-iccr-ip-fetcher',
    cmd,
    resource_deps=['eric-tm-ingress-controller-cr-contour-v1'],
    env = {'NAMESPACE':namespace}
  )