## Synopsis

The purpose of this project is to allow node-red to publish a node-red payload to Splunk's HTTP Event Collector. 

## Motivation

Wanted to make an easy avenue to publish data into Splunk through Node-Red.

## Installation

The easiest way to install is through the Node-Red Palette Manager that can be found in the menu on the top right hand corner of the Node-Red ui.

### Manual install with npm

```sh
npm install -g node-red-contrib-http-event-collector
```
### Install from source
From github:
Navigate to the your home directory on linux is is ~/.node-red/node-modules
```sh
git clone https://github.com/gdziuba/http-event-collector.git
```
```sh
cd http-event-collector
npm install
```

## Setup
[To configure Splunk's HTTP Event Collector, follow these instructions.](https://docs.splunk.com/Documentation/Splunk/9.1.2/Data/UsetheHTTPEventCollector)

[Example Node-RED configuration](https://i.imgur.com/9noXzGI.png)


## Examples:

### Node-RED Functions for converting msg to correct structure for Metric Event Collector. 

#### Single value MQTT payload message to Metric structure:
```sh
var o = msg.payload;
var v = msg.topic;
msg.payload = {};
msg.payload.fields = {};
msg.payload.fields._value = o;
msg.payload.fields.metric_name= v;
return msg;
```

#### Single value with dimensions enabled :
```sh
var o = msg.payload;
var v = msg.topic;
msg.payload = {};
msg.payload.splunkdims = true;
msg.payload.fields = {};
msg.payload.fields._value = o;
msg.payload.fields.metric_name= v;
msg.payload.fields.dimension1= "value1";
return msg;
```
