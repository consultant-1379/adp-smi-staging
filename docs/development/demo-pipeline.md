# Demo pipeline

The main purpose of this pipeline is to deploy GAS Light and Help Aggregator to namespace
to have the possibility to demonstrate their functionality. It is possible to deploy
the latest release or drop version of GAS Light and Help Aggregator.
Also the concrete version of GAS Light and Help Aggregator can be specified.

To run this pipeline and deploy demo page you should do the following:

1. Go to `adp-smi-staging-demo` pipeline on Jenkins and click 'Build with Parameters'.
2. You have to specify which version of GAS and HA you want to deploy in the `GAS_TYPE`
and `HA_TYPE` dropdowns.
There are three options, `latest release`, `latest drop`, `concrete version`.
3. If `concrete version` was chosen on previous step then
`GAS_VERSION` and `HA_VERSION` fields must be specified by using the following formats `2.9.0-9`
for existing version or `2.10.0+29` for + version.
4. `DEMO_INGRESS_PATH` field is optional. The path where GAS will be available,
set e.g. "adp-ui-service". If empty, the current  BUILD_TAG is used.
5. `DEMO_NAMESPACE` field is optional. The name of the demo namespace.
Required to be filled in case of + version demo.
If empty, the generated namespace is used. Also custom demo namespace can be specified.
6. `NAMESPACE_LABEL_VALUE` must be set. The name must be unique for the given developer
e.g. `SIGNUM_demo`.
Can be "release" or any other word. Do not use words `drop` and `release` for your custom deployments.
The `drop` is to be used **only** by scheduled trigger by Jenkins, and `release`
 is reserved for the release pipeline.
7. `INGRESS_TLS` field specifies `https` or `http` protocol to use.
8. `GERRIT_REFSPEC` - gerrit patchset refspec.
This is only used if there is a change in the ruleset or the Jenkins file.
The CI chart's stage can also be changed with this.
9. When all required fields are specified, the pipeline can be run.
10. Reference to deployed GAS can be found in the `var.demo-ingress-url` artifact.

If there is a necessity to add a new field, it can be done in `DemoDeploy.jenkinsfile`.
There is `parameters` field which represents fields in Jenkins.
