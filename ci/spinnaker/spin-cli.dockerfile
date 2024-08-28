ARG BASE_OS_IMAGE_URL=armdocker.rnd.ericsson.se/proj-ldc/common_base_os_release/sles
ARG BASE_OS_VERSION=5.6.0-11

FROM ${BASE_OS_IMAGE_URL}:${BASE_OS_VERSION}

# ----------- Main params
ARG SPIN_CLI=spin-1.29.0.tar.gz
ARG JSONNET=jsonnet-0.17.0.tar.gz

USER root

ARG ARM_USER
ARG ARM_PASSWORD

RUN zypper ar --gpgcheck-strict -C -f https://${ARM_USER}:${ARM_PASSWORD}@arm.sero.gic.ericsson.se/artifactory/proj-ldc-repo-rpm-local/common_base_os/sles/6.6.0-1 COMMON_BASE_OS_SLES_REPO \
  && zypper --gpg-auto-import-keys refresh \
  && zypper update -y \
  && zypper install -y wget \
  && zypper clean --all

# ----------- Spin cli
RUN wget https://${ARM_USER}:${ARM_PASSWORD}@arm.seli.gic.ericsson.se/artifactory/proj-eric-oss-dev-generic-local/eric-csm-st/${SPIN_CLI}
RUN tar -xvf ${SPIN_CLI}
RUN chmod +x spin
RUN mv spin /usr/local/bin/spin

# # ----------- Jsonnet
RUN wget https://${ARM_USER}:${ARM_PASSWORD}@arm.seli.gic.ericsson.se/artifactory/proj-eea-dev-docker-global/proj-eea-dev/jsonnet/${JSONNET}
RUN tar -xvf ${JSONNET}
RUN chmod +x jsonnet
RUN mv jsonnet /usr/local/bin/jsonnet
