load('./tilt-lib/config.star', 'get_settings')
load('./tilt-lib/deploy-ci-chart.star', 'deploy_ci_chart')
load('./tilt-lib/deploy-gas.star', 'deploy_gas')

settings = get_settings()
namespace = 'default'

mTLS = settings.get('mTLS')

# after .txt is updated by "tilt-iccr-ip-fetcher", Tiltfile is retriggered and ingressHost is recalculated
loadBalancerIp = read_file('tilt.iccr.ip.txt', default = '0.0.0.0')
loadBalancerIp = str(loadBalancerIp)

gas_ingressHost = ''.join([str(os.environ['USER']),'.gas.', loadBalancerIp, '.nip.io'])
ha_ingressHost = ''.join([str(os.environ['USER']),'.ha.', loadBalancerIp, '.nip.io'])
uis_ingressHost = ''.join([str(os.environ['USER']),'.uis.', loadBalancerIp, '.nip.io'])
dst_ingressHost = ''.join([str(os.environ['USER']),'.dst.', loadBalancerIp, '.nip.io'])

protocol = 'http'

if mTLS:
  protocol = 'https'

gasUrl=''.join([protocol, '://', gas_ingressHost, '/ui'])
haUrl=''.join([protocol, '://', ha_ingressHost,  '/ui'])
uisUrl=''.join([protocol, '://', uis_ingressHost])
dstUrl=''.join([protocol, '://', dst_ingressHost])

print('\nGAS UI address: ' + gasUrl + '\n')
print('\nHA UI address: ' + haUrl + '\n')
print('\nUIS rest address: ' + uisUrl + '\n')
print('\nDST address: ' + dstUrl + '\n')

# Handle remote mode
load('./tilt-lib/init-namespace.star', 'init_namespace', 'docker_login', 'generate_namespace_name')
if settings.get('mode') == 'remote':
  allow_k8s_contexts(settings.get('kubecontext'))
  local('node scripts/generate-npm-tokens.js')
  namespace = generate_namespace_name()
  init_namespace(namespace)
  #local('kubectl config set-context --current --namespace=' + namespace)
  docker_login()

deploy_ci_chart(ha_ingressHost, gas_ingressHost, uis_ingressHost, dst_ingressHost, loadBalancerIp, namespace)
deploy_gas(gas_ingressHost, namespace)