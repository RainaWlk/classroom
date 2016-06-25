class Client {
	constructor(req, res){
		this.req = req;
		this.res = res;
	}
}

class ConnInfo {
	constructor(){
		this.list = [];
	}

}

var connInfo = new ConnInfo;
//var app;

exports.info = connInfo;
//exports.app = app;