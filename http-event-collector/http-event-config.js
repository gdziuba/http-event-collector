module.exports = function(RED) {
    function HTTPEventConfig(c) {
        RED.nodes.createNode(this,c);
        this.URI = c.URI;
        this.Token = c.Token;
        this.SourceType = c.SourceType;
        this.Host = c.Host;
        this.Source = c.Source;
        this.Index = c.Index;
        this.LogLevel = c.LogLevel;
    }
    RED.nodes.registerType("splunk-http-event-config",HTTPEventConfig);
};
