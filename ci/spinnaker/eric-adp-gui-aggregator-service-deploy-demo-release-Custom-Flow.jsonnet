local notificationText = "Dear ${trigger.properties['COMMITTER_NAME']},";
local notificationProp = { text: notificationText };
local controller = 'eea-aispinn-seliius27190';
local jenkins = 'jenkins';
local chartVersionProp = "${trigger.properties['CHART_VERSION']}";
{
  application: "adp-smart-insights",
  id: "bcea4dc5-daa1-4a8e-9497-d255d64a92ab",
  description: "A pipeline template derived from pipeline \"eric-adp-gui-aggregator-service-deploy-demo-release-Custom-Flow\" in application \"adp-smart-insights\"",
  name: "eric-adp-gui-aggregator-service-deploy-demo-release-Custom-Flow",
  owner: "gabor.klinda@ericsson.com",
  scopes: [
    "global"
  ],
  keepWaitingPipelines: false,
  limitConcurrent: true,
  notifications: [
    {
      address: "PDLSCRUMNW@pdl.internal.ericsson.com",
      cc: "052b0392.ericsson.onmicrosoft.com@emea.teams.ms",
      level: "pipeline",
      message: {
        "pipeline.failed": notificationProp
      },
      type: "email",
      when: [
        "pipeline.failed"
      ]
    },
    {
      address: "f98b007c.ericsson.onmicrosoft.com@emea.teams.ms",
      level: "pipeline",
      message: {
        "pipeline.complete": notificationProp,
        "pipeline.failed": notificationProp,
        "pipeline.starting": notificationProp
      },
      type: "email",
      when: [
        "pipeline.starting",
        "pipeline.complete",
        "pipeline.failed"
      ]
    }
  ],
  schema: "1",
  spelEvaluator: "v4",
  stages: [
    {
      completeOtherBranchesThenFail: true,
      continuePipeline: false,
      failPipeline: false,
      job: "adp-smi-staging-demo",
      master: controller,
      name: "GAS Light Deploy Demo Release",
      parameters: {
        DEMO_INGRESS_PATH: "adp-ui-service",
        DEMO_NAMESPACE: "spinnaker-gas-demo-release",
        GAS_TYPE: "concrete version",
        GAS_VERSION: chartVersionProp,
        GERRIT_REFSPEC: "refs/heads/master",
        HA_TYPE: "latest release",
        NAMESPACE_LABEL_VALUE: "release",
        UIS_TYPE: "latest release"
      },
      propertyFile: "",
      refId: "1",
      requisiteStageRefIds: [],
      type: jenkins
    }
  ],
  triggers: [
    {
      enabled: true,
      job: "adp-ui-service-release",
      master: controller,
      propertyFile: "artifact.properties",
      type: jenkins
    }
  ],
  updateTs: "1701261103213"
}
