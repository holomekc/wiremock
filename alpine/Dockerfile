FROM wiremock/wiremock:3.12.0-1-alpine

LABEL maintainer="Christopher Holomek <holomekc.github@gmail.com>"
LABEL org.label-schema.name="wiremock-gui"
LABEL org.label-schema.build-date=${BUILD_DATE}
LABEL org.label-schema.version=${WIREMOCK_VERSION:-1.0}
LABEL org.label-schema.description="Extends WireMock with a graphical user interface"
LABEL org.label-schema.url="https://github.com/holomekc/wiremock"
LABEL org.label-schema.vcs-url="https://github.com/holomekc/wiremock"
# LABEL org.label-schema.vcs-ref=${GIT_SHA:0:7}
LABEL org.label-schema.vendor="Christopher Holomek"
LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.docker.cmd="docker run -it --rm -p 8080:8080 -v $PWD/stubs:/home/wiremock holomekc/wiremock-gui:latest"
LABEL org.label-schema.docker.cmd.debug="docker run -it --rm -p 8080:8080 -v $PWD/stubs:/home/wiremock holomekc/wiremock-gui:latest --verbose"
LABEL org.label-schema.docker.cmd.help="docker run -it --rm -p 8080:8080 -v $PWD/stubs:/home/wiremock holomekc/wiremock-gui:latest --help"

# Update again in case we need to update before wiremock image is updated
RUN apk update && apk upgrade
RUN apk add curl

ARG WIREMOCK_VERSION

# we remove the official standalone jar to reduce image size and download our own file
RUN rm /var/wiremock/lib/*.jar
RUN  curl -fL "https://github.com/holomekc/wiremock/releases/download/$WIREMOCK_VERSION/wiremock-standalone-$WIREMOCK_VERSION.jar" -o /var/wiremock/lib/wiremock.jar
