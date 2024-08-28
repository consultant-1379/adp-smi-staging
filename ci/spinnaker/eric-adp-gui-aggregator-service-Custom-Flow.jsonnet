local notificationText = "Dear ${trigger.properties['COMMITTER_NAME']},";
local notificationProp = { text: notificationText };
local controller = 'eea-aispinn-seliius27190';
local jenkins = 'jenkins';
local chartVersionProp = "${trigger.properties['CHART_VERSION']}";
{
  application: "adp-smart-insights",
  id: "f62a6112-a279-4d63-9ae4-b95d31218a20",
  description: "A pipeline template derived from pipeline \"eric-adp-gui-aggregator-service-Custom-Flow\" in application \"adp-smart-insights\"",
  name: "eric-adp-gui-aggregator-service-Custom-Flow",
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
      completeOtherBranchesThenFail: false,
      continuePipeline: true,
      failPipeline: false,
      job: "adp-ui-service-vuln",
      master:controller,
      name: "GAS Light Vulnerability Analysis",
      parameters: {
        GERRIT_REFSPEC: "",
        HELM_VERSION: chartVersionProp,
        MANAGE_JIRA: true,
        UPLOAD_ARM: true,
        UPLOAD_ERIDOC: true,
        UPLOAD_VHUB: true
      },
      propertyFile: "",
      refId: "1",
      requisiteStageRefIds: [
        "4"
      ],
      stageTimeoutMs: 10800000,
      type: jenkins
    },
    {
      completeOtherBranchesThenFail: false,
      continuePipeline: true,
      failPipeline: false,
      job: "adp-ui-service-characteristics-verification",
      master:controller,
      name: "GAS Light Characteristics Verification",
      parameters: {
        GAS_VERSION: chartVersionProp,
        PUBLISH_PERFORMANCE_REPORT: true
      },
      refId: "4",
      requisiteStageRefIds: [
        "5"
      ],
      type: jenkins
    },
    {
      completeOtherBranchesThenFail: false,
      continuePipeline: true,
      failPipeline: false,
      job: "adp-ui-service-deploy-upgrade-robustness-loop",
      master:controller,
      name: "GAS Light Upgrade Robustness",
      parameters: {
        GAS_VERSION: chartVersionProp,
        PUBLISH_REPORT: true
      },
      refId: "5",
      requisiteStageRefIds: [],
      type: jenkins
    },
    {
      continuePipeline: false,
      failPipeline: true,
      job: "adp-smi-staging-ha-gas-combined",
      master:controller,
      name: "Combined deploy HA and GAS",
      parameters: {},
      propertyFile: "",
      refId: "6",
      requisiteStageRefIds: [
        "1"
      ],
      type: jenkins
    }
  ],
  triggers: [
    {
      enabled: true,
      job: "adp-ui-service-drop",
      master:controller,
      propertyFile: "artifact.properties",
      type: jenkins
    }
  ],
  updateTs: "1687431191434"
}
