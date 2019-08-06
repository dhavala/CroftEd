#!/bin/bash

set -o errexit
set -o pipefail

sudo apt-get update
sudo apt-get install pigpio