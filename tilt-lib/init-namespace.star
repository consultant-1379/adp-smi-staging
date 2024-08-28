load('ext://namespace', 'namespace_create')
load('config.star', 'get_settings')

settings = get_settings()
docker_registries = settings.get('dockerRegistries')

def secret_yaml(
    namespace,
    url,
    secret_name,
    username,
    password,
  ):
  """Returns YAML for a secret
  Returns:
    The namespace YAML as a blob
  """
  args = [
    "kubectl",
    "create",
    "secret",
    "docker-registry",
    secret_name,
    "--docker-server=" + url,
    "--docker-username=" + username,
    "--docker-password=" + password,
    "--namespace=" + namespace,
    "-o=yaml",
    "--dry-run=client"
  ]
  return local(args, quiet=True)

def init_namespace(namespace):
    namespace_create(namespace)
    for registry in docker_registries:
      current_registry = docker_registries[registry]
      username = os.environ[current_registry['username']]
      password = os.environ[current_registry['password']]
      k8s_yaml(secret_yaml(namespace, current_registry['url'], current_registry['secretName'], username, password))

def docker_login():
  docker_config = read_json(os.getenv('HOME') + '/.docker/config.json', default={})
  for registry in docker_registries:
    current_registry = docker_registries[registry]
    if not docker_config.get('auths') or current_registry['url'] not in docker_config.get('auths'):
      username = os.environ[current_registry['username']]
      password = os.environ[current_registry['password']]
      local('docker login ' + current_registry['url'] + ' --username=' + username + ' --password=' + password)

def generate_namespace_name():
  namespace = settings.get('exactnamespace', '')
  if namespace == '':
    namespace = settings.get('namespace_prefix') + '-' + os.environ['USER']
  return namespace
