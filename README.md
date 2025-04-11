# WireMock with GUI

Extends [WireMock](http://wiremock.org) with a graphical user interface

[![Release](https://img.shields.io/github/v/release/holomekc/wiremock)](https://github.com/holomekc/wiremock/releases)
[![Main](https://github.com/holomekc/wiremock/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/holomekc/wiremock/actions/workflows/build-and-test.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/holomekc/wiremock-gui.svg)](https://hub.docker.com/r/holomekc/wiremock-gui/)
[![Docker Image Version](https://img.shields.io/docker/v/holomekc/wiremock-gui)](https://hub.docker.com/r/holomekc/wiremock-gui/)

## Key Features

- Mappings
  - A paginated list or folder view of all mappings
  - Search for mappings
  - Add / Edit / Remove new mappings
  - Add templates directly into mapping (Response Templating, Proxying, etc.)
  - Save / Reset / Remove all mappings
  - Reset all scenarios
  - Separated view improve readability
  - Test mapping
    - Allows to quickly test the mapping by sending http requests.
- Files
  - Upload, Download files
  - Create or edit files
- Matched
  - A paginated list of all requests which could be handled by Wiremock
  - Copy cUrl
  - Reset Journal
- Unmatched
  - A paginated list of all requests which could not be handled by Wiremock
  - Copy cUrl
  - Copy request to clipboard for new mapping creation
  - Copy SOAP to clipboard which understands not matched SOAP requests and help during creation
  - Reset Journal
- StateMachine (experimental)
  - A paginated list of all mappings which are part of a scenario
  - States are calculated automatically
  - Mappings are represented as links
  - Button on links allows to show mapping details
- Record/playback of stubs
  - Help to start recording or snapshot
- Auto refresh when mappings or requests changes

## Where do I find the GUI?

The gui is part of the Wiremock admin interface. Therefore, just open the following URL:

\<Wiremock baseUrl\>/__admin/webapp

## Folder view

Since 2.32.0.2

For mappings the folder view is selected by default. It is still possible to switch to the flat list view.

If mappings are stored on a drive in different directories, this structure will be extracted and mappings metadata will
be updated automatically, so that wiremock-gui can show the same folder structure.

You can also update mapping metadata to create a structure manually. This helps if you do not store mappings, but load
them via http, or if you do not want to place the file in different directories.

metadata structure:

```json
{
  "metadata": {
    "wiremock-gui": {
      "folder": "/some/folder"
    }
  }
}
```

will create following structure in the gui:

![alt folder-image](./images/folder.png)

While editing a mapping you can add the metadata structure for a folde via "general functions" -> "add Folder".

### drag-and-drop

drag-and-drop into folders is currently <b>not</b> supported. It is a more complex topic, as it is currently not
possible to sort mappings.

There is a branch on which drag-and-drop is implemented. So if you are interested you can test it there. Due to the
mentioned not supported sorting mappings might jump to a different location after reloading.

# Test mappings

Since 2.32.0.2

Allows testing of mappings via an HTTP request. This feature tries to extract url and content-type from mapping
information. The prefilled data highly depends on how the request in the mapping is defined.

When executing the request the response is shown. A badge indicates if the selected mapping answered the
request. If this is the case the following is shown:

![alt test-match](./images/test-matches.png)

If another mapping answered the request a link to the mapping, which answered the request is shown:

![alt test-no-match](./images/test-no-match.png)

Keep in mind this feature will never be as powerful as tools like Postman, Insomnia, etc. So the overall idea is to
provide a quick way to test if your mapping is properly setup.

## Features except gui

Custom Handlebars helpers

| Name | Parameter | Description                                                                                         |
|------|-----------|-----------------------------------------------------------------------------------------------------|
| JWT  | algo      | Signing algorithm. Check jsonwebtoken for SignatureAlgorithm. E.g. RS256                            |
|      | key       | Base64 encoded key to use. Kind of key depends on used algo                                         |
|      | claims    | a json string which describes the claims to use. Must not be null in case no payload is defined     |
|      | payload   | a json string which contains the content of the jwt. Must not be null in case no claims are defined |
|      | header    | a json string which contains the header to use                                                      |

## Docker

### Breaking Change > 2.35.0.1

The docker images are based on the official [wiremock](https://hub.docker.com/r/wiremock/wiremock) images now.
Therefore, check the official guide regarding configuration etc. The docker compose example below is alread updated.

### Docker Compose

A short example of a compose file

```yaml
version: "3"
services:
  wiremock:
    image: "holomekc/wiremock-gui:latest"
    container_name: my_wiremock
    ports:
      # This is just an example of a port mapping
      - "8088:8089"
      - "8084:8088"
    command:
      "--port 8089 --https-port 8088 --max-request-journal 1000 --local-response-templating"
    volumes:
      - ./root-dir:/home/wiremock
    environment:
      WIREMOCK_MY_VAR: "systemValue response templating feature"
```

### Docker Images

[Docker Hub](https://hub.docker.com/r/holomekc/wiremock-gui)

In the past only alpine images existed. New versioning concept is:

holomekc/wiremock-gui:{version} or holomekc/wiremock-gui:latest

- linux/amd64
- linux/arm/v7
- linux/arm64

holomekc/wiremock-gui:{version}-alpine or holomekc/wiremock-gui:latest-alpine

- linux/amd64

#### Mac M[1-2]

In case you want to use this Docker image on an Apple Mac with M1 or M2 processor you cannot use the alpine image. The
docker images are based on the official wiremock docker images. I only replace the wiremock jar file in the image. The
official wiremock docker images use eclipse-temurin as base image for the alpine and none alpine version. Sadly the
alpine version of temurin does not support arm yet. See: https://github.com/adoptium/containers/issues/158.
Theoretically, I could switch to a different base image, but this would create increased maintenance. I hope temurin is
updated soon-ish. Please use the none alpine version on a Mac for the time being.

#### Images

[Mappings](./images/mappings.png)

[Separated View](./images/mappings-separated.png)

[StateMachine](./images/state-machine.png)

[Test](./images/test.png)

[Test Response](./images/test-response.png)

#### Security
- XSS issue in versions < 3.0.4.0. See: https://github.com/holomekc/wiremock/issues/51 for details.
