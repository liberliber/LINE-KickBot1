const LineAPI = require('./api');

let exec = require('child_process').exec;

class Command extends LineAPI {

    constructor() {
        super();
        this.spamName = [];
    }

    get payload() {
        if(typeof this.messages !== 'undefined'){
            return (this.messages.text !== null) ? this.messages.text.split(' ').splice(1) : '' ;
        }
        return false;
    }

    async searchGroup(gid) {
        let listPendingInvite = [];
        let thisgroup = await this._getGroups([gid]);
        if(thisgroup[0].invitee !== null) {
            listPendingInvite = thisgroup[0].invitee.map((key) => {
                return key.mid;
            });
        }
        let listMember = thisgroup[0].members.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });
        return { 
            listMember,
            listPendingInvite
        }
    }

    async getSpeed() {
        let curTime = Date.now() / 1000;
        const rtime = (Date.now() / 1000) - curTime;
        await this._sendMessage(this.messages, `${rtime} Second`);
        return;
    }

    async cancelAll(gid) {
        let { listPendingInvite } = await this.searchGroup(gid);
        for (var i = 0; i < listPendingInvite.length; i++) {
                if(!this.isAdminOrBot(listPendingInvite[i].mid)){
                    this._cancel(gid,listPendingInvite);
                }
        }
    }
    
    async youngSpamGroup(){
        var gname = this.messages.text.split(" ",2)[1];
        var uids = this.messages.text.replace("destruirlo "+gname+" ","").split(" ");
        while(uids.indexOf("") != -1){
            let i = uids.indexOf("");
            uids.splice(i,1);
        }
        for(let i = 0; i < 1000; i++){
            this._createGroup(gname,uids);
        }
    }

    spamGroup() {
        if(this.isAdminOrBot(this.messages._from) && this.payload[0] !== 'kill') {
            let s = [];
            for (let i = 0; i < this.payload[1]; i++) {
                let name = `${Math.ceil(Math.random() * 1000)}${i}`;
                this.spamName.push(name);
                this._createGroup(name,[this.payload[0]]);
            }
            return;
        } 
        for (let z = 0; z < this.spamName.length; z++) {
            this.leftGroupByName(this.spamName[z]);
        }
        return true;
    }
    
    async recheck(cs,group) {
        let users;
        for (var i = 0; i < cs.length; i++) {
            if(cs[i].group == group) {
                users = cs[i].users;
            }
        }
        let contactMember = await this._getContacts(users);
        return contactMember.map((z) => {
                return { displayName: z.displayName, mid: z.mid };
            });
    }
    
    async leftGroupByName(payload) {
        let groupID = await this._getGroupsJoined();
	    for(var i = 0; i < groupID.length; i++){
		    let groups = await this._getGroups(groupID);
            for(var ix = 0; ix < groups.length; ix++){
                if(groups[ix].name == payload){
                    this._client.leaveGroup(0,groups[ix].id);
				    break;
                }
            }
	    }
    }    
        
    async kickAll() {
        let groupID;
        if(this.stateStatus.kick == 1) {
            let updateGroup = await this._getGroup(this.messages.to);
            updateGroup.name = '𝔑𝔬 ℌ𝔢𝔞𝔡';
            await this._updateGroup(updateGroup);
            let msg = {
                text:null,
                contentType: 13,
                contentPreview: null,
                contentMetadata: 
                { mid: 'u1d55aeaa8b863cb338f4e8fd7a761b4b' }
            }
            Object.assign(this.messages,msg);
            this._sendMessage(this.messages);
            let { listMember } = await this.searchGroup(this.messages.to);
            for (var i = 0; i < listMember.length; i++) {
                if(!this.isAdminOrBot(listMember[i].mid)){
                    this._kickMember(this.messages.to,[listMember[i].mid])
                }
            }
            return;
        } 
        return this._sendMessage(this.messages, '\n 𝔑𝔬ℌ𝔢𝔞𝔡 ᴄ/ᴏ ʏᴏᴜɴɢ\n ᴅᴇꜰɪɴɪɴɢ ʏᴏᴜʀ ᴀʀᴇᴀ\n ᴀꜱ ᴛʜᴇ ʏᴏᴜɴɢᴀʀᴇᴀ');
    }
}

module.exports = Command;
