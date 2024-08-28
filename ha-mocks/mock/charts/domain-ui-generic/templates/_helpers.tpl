{{/*
Expand the name of the chart.
*/}}
{{- define "domain-ui-generic.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create image registry url
*/}}
{{- define "domain-app.registryUrl" -}}
{{- if .Values.imageCredentials.registry.url -}}
{{- print .Values.imageCredentials.registry.url -}}
{{- else -}}
{{- print .Values.global.registry.url -}}
{{- end -}}
{{- end -}}

{{/*
Create image pull secrets
*/}}
{{- define "domain-app.pullSecrets" -}}
    {{- $globalPullSecret := "" -}}
    {{- if .Values.global -}}
        {{- if .Values.global.pullSecret -}}
            {{- $globalPullSecret = .Values.global.pullSecret -}}
        {{- end -}}
    {{- end -}}
    {{- if .Values.imageCredentials.pullSecret -}}
        {{- print .Values.imageCredentials.pullSecret -}}
    {{- else if $globalPullSecret -}}
        {{- print $globalPullSecret -}}
    {{- end -}}
{{- end -}}


{{/*
Generate ingress path
*/}}
{{- define "domain-app.ingressPath"}}
{{- printf "/%s" ( default .Values.ingress.path "" | trimSuffix "/" | trimPrefix "/" | replace "-" "_") -}}
{{- end }}


{{/*
Generate ingress hostname for ICCR
*/}}
{{- define "domain-app.iccrHostname"}}
{{- printf "%s.%s.%s.nip.io" (default "demo-service" .Values.global.uid)  (include "domain-ui-generic.name" .) (default "0.0.0.0" .Values.ingress.iccrIP) }}
{{- end }}

{{/*
Create dst collector url
*/}}
{{- define "domain-ui-generic.otelExporterOtlpEndpoint" -}}
  {{- if .Values.dst -}}
    {{- if .Values.dst.enabled -}}
      {{- print (.Values.global.security.tls.enabled | ternary "https://" "http://") .Values.dst.collector.host ":" .Values.dst.collector.otlpHttpPort }}
    {{- else -}}
      {{- printf "" -}}
    {{- end -}}
  {{- end -}}
{{- end -}}