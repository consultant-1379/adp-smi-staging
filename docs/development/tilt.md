# Tilt

Tilt is a development tool for Kubernetes based development.
It speeds up the local deployment of an application during code change.

Current tilt configuration provides the same deployment as `demo` CI pipeline by default, pre-configured
with set of additional configuration files to achieve the same deployment as for the `demo`
deployment CI pipeline.

## Install

```bash
 curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
```

After installation verify Tilt with

```bash
tilt version
```

## Local execution

The default mode is `local`. In local mode the used namespace is `default`
if `exactnamespace` option is not set.
This mode is preferred when using a local kubernetes cluster.
To start using locally just jump to [Usage](#usage).
For other options check the [Configuration](#configuration) chapter.

## Prerequirements

- If you would like to test the integration with other services, then
  you have to refresh the helm dependencies under the `charts/ci` folder.

```bash
cd charts/ci
rm -rf charts/*
helm repo add proj-adp-gs-all-helm-sero \
https://arm.sero.gic.ericsson.se/artifactory/proj-adp-gs-all-helm
helm repo add proj-adp-gs-all-helm-rnd \
https://arm.rnd.ki.sw.ericsson.se/artifactory/proj-adp-gs-all-helm
helm repo add proj-eea-drop-helm \
https://arm.seli.gic.ericsson.se/artifactory/proj-eea-drop-helm
helm repo add proj-pc-rs-released-helm \
https://arm.sero.gic.ericsson.se/artifactory/proj-pc-rs-released-helm

helm dep update
```

- If you have to install an ingress controller in case of a local kubernetes environment,
  because ingress resources are used during the tilt deployment.

With minikube use:

```bash
minikube addons enable ingress
```

## Quick start

These are the quick steps to start working with a remote cluster.
For detailed explanations or troubleshooting check the [Remote execution](#remote-execution) chapter.

1. save `tilt.option.user.template.json` as `tilt.option.user.json`
2. set `mode` to `remote` in `tilt.option.user.json`
3. start tilt: `tilt up`. See [Usage](#usage)

In the remote development a unique namespace is created for your deployments.
To interact with them add the namespace to your context or append the namespace flag to all kubectl command.

## Configuration

The main Tiltfile is in the root: `Tiltfile`
It uses some configuration files to define where to connect and how to create the resources.
`tilt.option.json` is the default configuration which is merged into the repo.
It can be overwritten with `tilt.option.user.json` which is gitignored to avoid unnecessary changes.
Mostly the execution mode (local / remote) and the required services can be selected, but any
option can be overridden if needed.

### Default configuration

In the default configuration `mTLS` is enabled. Other parameters are configured by files shared with
ci deployment, to provide input for CI chart: `./ci/config/mocks-config.yaml`,
`./ci/config/demo-ci-chart-values.yaml`, `./ci/config/mocks-enable-demo.yaml`, and for GAS chart -
`./ci/config/demo-chart-values.yaml`.

### Configuration files

`tilt.option.json` - this is a generic options file which is used as default config

```json
{
  "mode": "local", // can be local or remote
  "exactnamespace": "", // The exact namespace to be used. It is used in local mode too if given
  "dockerRegistries": {
    "armdocker": {
      "url": "armdocker.rnd.ericsson.se", // url of the docker registry
      "path": "proj-eea-dev", // path of the repo (used for built images)
      "secretName": "arm-pullsecret", // the name of the pullsecret created on the kubernetes cluster
      "username": "ARM_USER_SELI", // the name of the env var where the username will be read from
      "password": "ARM_TOKEN_SELI" // the name of the env var where the password will be read from
    }
  },
  // The namespace prefix to generate unique name. Only used if 'exactnamespace' is an empty string
  "namespace_prefix": "dev",
  "kubecontext": "kubernetes-admin@dev-presentation", // The kubecontext used for remote connection,
  // Extend below array in case of K8s server version incompatibility with Capabilities
  "customK8sApiVersions": ["policy/v1/PodDisruptionBudget", "policy/v1", "batch/v1/CronJob"],
  // Additional configuration files shared with CI demo deployment
  "additionalCiValues": [
    "./ci/config/mocks-config.yaml",
    "./ci/config/demo-ci-chart-values.yaml",
    "./ci/config/mocks-enable-demo.yaml"
  ],
  // Additional configuration files used for GAS deployment - shared with demo deployment ci pipeline
  "additionalGasValues": ["./ci/config/demo-chart-values.yaml"],
  "gasImageName": "eric-adp-gui-aggregator-service",
  "gasVersion": "2.22.0-33",
  "gasRepo": "https://arm.seli.gic.ericsson.se/artifactory/proj-eea-drop-helm",
  // gas image will be pulled to this folder. will be removed after deployment.
  "gasImageTempFolder": "./temp-charts",
  "mTLS": true, // If globally TLS is on or off
  "enableAuthentication": true, // Turn on authentication and install IAM
  "iamUserName": "gas-user", // Username for accessing WS/UI when auth enabled
  "iamUserPassword": "Ericsson123!", // Password for access
  "deployDSTServices": true // Deploy distributed tracing
}
```

`tilt.option.user.json` - this is a gitignored file to store user specific configs
Create this file and add the desired json structure.
Any other attribute from the `tilt.option.json` can be added to define custom value for it.
Check the `tilt.option.user.template.json` for an empty example.

For information on environment variables e.g. for credentials to docker registries and repositories
check the [Dev env documentation.](dev-env.md#environment-variables)

### Charts configuration files

Tilt deployment configures charts via files, shared with CI deployment.
Default set of additional configuration files to achieve the same deployment as for the `demo`
deployment ci pipeline.

For CI chart:
`./ci/config/mocks-config.yaml`
`./ci/config/demo-ci-chart-values.yaml`
`./ci/config/mocks-enable-demo.yaml`

For GAS chart:
`./ci/config/demo-chart-values.yaml`

To deploy services with no additional values, `additionalCiValues` and `additionalGasValues` in
`tilt.option.user.json` should be empty arrays.

> Note that mocks are not built in the combined pipeline only during Drop pipeline execution.

## Remote execution

In remote mode the Tiltfile does some extra initialization steps based on `tilt.option.json`:

- generate unique namespace
- create the namespace
- create pullsecrets in the namespace
- login to docker repositories
- and allow the kubectl context defined in the configuration

To use a remote cluster the kubectl context has to be changed to connect to a remote cluster.
For cluster info check [this wiki](https://eteamspace.internal.ericsson.com/display/EIT/Clusters).
See the K8s.io docs: [Configure Access to Multiple Clusters](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)

### Kubectl context

Change kubectl context to point to the remote cluster.

```bash
# If KUBECONFIG is empty add the default config from HOME first
export KUBECONFIG=$HOME/.kube/config
# Check the result. Both seliics01760e01 and minikube shall be present
kubectl config view
# To switch to remote cluster
kubectl config use-context kubernetes-admin@dev-presentation
# To switch back to local cluster
kubectl config use-context minikube
```

### Configure Tilt

For more info about the configuration see: [Configuration](#configuration)

Change the `tilt.option.json` file.

- set mode to `remote`
  - by default no other config change is necessary
  - and also the namespace is: \<namespace_prefix\>-\<username\>
  - but if the `exactnamespace` is set in the config then that is used as the namespace
- then set your context to that namespace:
  `kubectl config set-context --current --namespace=<NAMESPACE NAME>`

## Usage

To start tilt: `tilt up`

Then press space to open Tilt console in a browser. It will show the process of the build and
the status of the services. At first time it builds the docker images which may take time.
When finished the logs of the processes can be seen on the UI.
Note: it can take up to 20-30 minutes to start everything, if all dependencies are enabled.

To stop: Ctrl+C then `tilt down` to remove services from kubernetes.
_Note: by default the namespaces created by Tilt are not deleted._
To do use the --delete-namespaces flag: `tilt down --delete-namespaces`
Especially when CI pods are not starting e.g. due to secret issues, delete the namespace.

If anything is changed (eg. Docker file, source code, Tiltfile),
then the build process is automatically restarted and the changed services are replaced
with the new version. The config is optimized for fast update, but the overall time depends
which part of the code is changed.

## Implementation

The tilt config is based on the official [NodeJS tutorial](https://docs.tilt.dev/example_nodejs.html).
This focuses on short reload cycles, and it is achieved by multiple optimizations:

**Helm template plugin**: this tilt plugin allows transforming helm templates to kubernetes resource
descriptors. To make this work the name of the deployed images shall be configurable from helm cli
parameters. The _tag name_ is automatically generated and overridden by Tilt, but other part of the
image name must be the same as used in `docker_build` methods.
In the context of ADP these are:

- registry URL
- repoPath
- image name

**Optimized Dockerfile**, where `npm install` is executed first and the source files are copied second.
With this, the result of npm install can be cached by the docker registry which can speed up a
docker build.

**Live update**: tilt provides a live update mechanism where file changes can be copied into a running
pod. The service watches file changes and restarts when detects new files.

For smi-staging tilt is watching files in charts/ci repo and will re-deploy corresponding k8s resources.
