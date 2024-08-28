ARG BASE_OS_VERSION=5.6.0-11
ARG COMMON_BASE_OS_DOCKER_URL=armdocker.rnd.ericsson.se/proj-ldc/common_base_os_release/sles
ARG NODEJS_BUILDER_VERSION=20.12.2-0
ARG NODEJS_BUILDER_URL=armdocker.rnd.ericsson.se/proj-adp-cicd-drop/adp-nodejs-lts-builder-image

FROM $NODEJS_BUILDER_URL:$NODEJS_BUILDER_VERSION as nodejs

WORKDIR /runtime/server
COPY .bob/temp-mock/mock/domain-ui-generic .
RUN --mount=type=secret,id=arm_npm_token --mount=type=secret,id=rnd_arm_npm_token \
export ARM_NPM_TOKEN=$(cat /run/secrets/arm_npm_token) && \
export RND_ARM_NPM_TOKEN=$(cat /run/secrets/rnd_arm_npm_token) && \
npm install

FROM $COMMON_BASE_OS_DOCKER_URL:$BASE_OS_VERSION as production
WORKDIR /runtime/server
COPY --from=nodejs /opt/nodejs/ /opt/nodejs/
COPY --from=nodejs /runtime/server /runtime/server

ENV PATH=${PATH}:/opt/nodejs/latest/bin

CMD [ "npm", "start" ]
