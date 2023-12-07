FROM ubuntu:latest

COPY setup.sh setup.sh
RUN chmod +x setup.sh
RUN apt update
RUN apt install curl -y

RUN curl -sSL https://get.livekit.io | bash

ENTRYPOINT [ "bash", "setup.sh" ]