## Synopsis

The purpose of this project is to allow node-red to publish a node-red payload to Splunk's HTTP Event Collector. 

This node pushes data to Splunk's HTTP event collector. Configure a new data source within Splunk's interface under settings> data inputs> Http Event Collector. Either create a new source or use an existing. Once finished setting up the source, you will receive a Token. This token will be added to the node settings within the node-red UI. The next step, in setting up your HTTP Event Collector, is to make sure that the Global setting are correct. In the top right hand corner of the Splunk UI, while in the Http Event Collector Configurator, there is a Global settings button. Ensure "All Tokens" is enabled and that the "Enable SSL" button is checked. Also take note of the HTTP Port Number, This will be used later. Now go back to the Node-Red UI and add the "http event collector" node and double click to open settings. Paste the Token from Splunk into the Token's field and enter in the URI, ensuring to include "https://" Now add your ip or host name. Finally add the port, which will typically be "8088", but can be manually changed by noting HTTP Port Number in the Global Settings of the Http Event collector configuration page.


## Motivation

Wanted to make an easy avenue to publish data into Splunk through Node-Red.

## Installation

```sh
npm install -g http-event-collector
```
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
Navigate to your node-red instance and add the http-event-collector node.  Double click to edit the node parameters.

[Example configuration](https://i.imgur.com/9noXzGI.png)

