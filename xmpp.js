var XMPP = require('./xmpp_library');
var wxmpp = XMPP.xmpp;
var dict = require('dict');
var fs = require('fs');
var txmpp = require('./terminal-xmpp');
var mxmpp = require('./build-xmpp');

var isConnected = false;

var isConnected = false;
function connect()
{
	var file_data = fs.readFileSync('/boot/wyliodrin.json');
	var d = JSON.parse(file_data);
	var jid = d.jid;
	var password = d.password;
	var owner = d.owner;
	console.log('owner = '+owner);

	if(!isConnected)
	{
		
		var connection = new wxmpp.Client({jid:jid,password:password,preferredSaslMechanism:'PLAIN'});
		isConnected = true;
		
		connection.on ('error', function(error)
		{
		  console.error (error);
		});

		connection.on ('disconnect', function()
		{
		  console.error ('disconnect');
		});

		connection.on ('online', function()
		{
		  console.log (jid+"> online");
		  connection.send(new wxmpp.Element('presence',
		           {}).
		      c('priority').t('50').up().
		      c('status').t('Happily echoing your <message/> stanzas')
		     );
		  connection.send(new wxmpp.Element('presence',
		  {
		  	type:'subscribe',
		  	to:owner
		  }));
		});

		connection.on ('rawStanza', function (stanza)
		{
		  console.log (jid+'>'+stanza.root().toString());
		});
	//	wxmpp.on ('stanza', function (stanza)
	//	{
	//	  console.log (this.jid+'>'+stanza.root().toString());
	//	  if (stanza.is('message') && stanza.attrs.type !== 'error')
	//	  {
	//	  	shells = stanza.getChild ('shells', 'wyliodrin');
	//	 } 			  
	//	});
		connection.load(function (xmpp, from, to, stanza, error)
		{
			if (stanza.getName()=='presence')
			{
				if (stanza.attrs.type == 'subscribe')
				{
					if (from == owner)
					{
						connection.send(new wxmpp.Element('presence',
		  				{
		  					type:'subscribed',
		  					to:owner
		  				}));

					}
				}
			}
		});		
		connection.tag('shells', XMPP.WYLIODRIN_NAMESPACE, txmpp.shellStanza);
		connection.tag('make', XMPP.WYLIODRIN_NAMESPACE, mxmpp.buildStanza);
		isConnected = true;
	}
}

function disconnect(jid)
{
	if(isConnected)
	{
		wxmpp.end(jid);
		isConnected = false;
	}
} 

// function send(stanza, to, t)
// {
// 	t.send(new wxmpp.Element('message',{to:to})).c(stanza);
// }

exports.connect = connect;
