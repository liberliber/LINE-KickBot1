const LineAPI = require('./api');
const request = require('request');
const fs = require('fs');
const unirest = require('unirest');
const webp = require('webp-converter');
const path = require('path');
const rp = require('request-promise');
const config = require('./config');
const { Message, OpType, Location } = require('../curve-thrift/line_types');
//let exec = require('child_process').exec;

const myBot = ['u1d55aeaa8b863cb338f4e8fd7a761b4b','u99f8059e2924cfa7519e26691b3cbb78'];
const banList = [];//Banned list
var groupList = new Array();//Group list
var vx = {};var midnornama,pesane,kickhim;var waitMsg = "no";//DO NOT CHANGE THIS
const imgArr = ['png','jpg','jpeg','gif','bmp','webp'];//DO NOT CHANGE THIS
var komenTL = "Sudah Dilike Bro, Jangan Ngemis Lagi"; //Comment for timeline
var bcText = "Masukan teks untuk broadcast";
var limitposts = '10'; //Output timeline post

function isAdminOrBot(param) {
    return myBot.includes(param);
}

function isBanned(banList, param) {
    return banList.includes(param);
}

function firstToUpperCase(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function isTGet(string,param){
	return string.includes(param);
}

function isImg(param) {
    return imgArr.includes(param);
}

function ambilKata(params, kata1, kata2){
    if(params.indexOf(kata1) === false) return false;
    if(params.indexOf(kata2) === false) return false;
    let start = params.indexOf(kata1) + kata1.length;
    let end = params.indexOf(kata2, start);
    let returns = params.substr(start, end - start);
    return returns;
}

class LINE extends LineAPI {
    constructor() {
        super();
		this.limitposts = limitposts; //Output timeline post
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
			autojoin: 0, //0 = No, 1 = Yes
            cancel: 0, //0 = Auto cancel off, 1 = on
            kick: 1, //1 = Yes, 0 = No
			mute: 0, //1 = Mute, 0 = Unmute
			protect: 1, //Protect Qr,Kicker
			qr: 0, //0 = Gk boleh, 1 = Boleh
			salam: 1 //1 = Yes, 0 = No
        }
		this.keyhelp = "\n\
𝔑𝔬ℌ𝔢𝔞𝔡 ᴄᴏᴍᴍᴀɴᴅs\n\n\
⍟Main Menu\n\
		•absen\n\
		•bubar\n\
		•vykhodi\n\
		•speed\n\
		•tagall\n\
		•kepo\n\
		•myid\n\
	  •cekid\n\
		•banlist\n\
		•Apakah\n\
		•gURL\n\
		•ginfo\n\
⍟Admin Menu\n\
		•adminutil\n\
		•mute\n\
		•unmute\n\
		•refresh\n\
		•ban\n\
		•unban\n\
		•kickban\n\
		•grouputil\n\
		•ᴏ̶ᴘ̶ʀ̶ᴀ̶ᴋ̶ᴇ̶ɴ̶̶\n\
⍟Settings
\n\n\ 𝔑𝔬ℌ𝔢𝔞𝔡 ᴄ/ᴏ ʏᴏᴜɴɢ\n\
ᴅᴇꜰɪɴɪɴɢ ʏᴏᴜʀ ᴀʀᴇᴀ\n\
ᴀꜱ ᴛʜᴇ ʏᴏᴜɴɢᴀʀᴇᴀ\n\";
        var that = this;
    }
    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                //if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                //}
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            const txt = (operation.message.text !== '' && operation.message.text != null ) ? operation.message.text : '' ;
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from_ : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            if(waitMsg == "yes" && operation.message.from_ == vx[0] && this.stateStatus.mute != 1){
				this.textMessage(txt,message,message.text)
			}else if(this.stateStatus.mute != 1){this.textMessage(txt,message);
			}else if(txt == "unmute" && isAdminOrBot(operation.message.from_) && this.stateStatus.mute == 1){
			    this.stateStatus.mute = 0;
			    this._sendMessage(message,"ヽ(^。^)ノ")
		    }else{console.info("muted");}
        }

        if(operation.type == 13 && this.stateStatus.cancel == 1 && !isAdminOrBot(operation.param2)) {//someone inviting..
            this.cancelAll(operation.param1);
        }

		//if(operation.type == 2 || operation.type == 1 || operation.type == 53 || operation.type == 43 || operation.type == 41 || operation.type == 24 || operation.type == 15 || operation.type == 21){console.info(operation);}

		if(operation.type == 16 && this.stateStatus.salam == 1){//join group
			let halo = new Message();
			halo.to = operation.param1;
			halo.text = "Welcome Saya\n";
			this._client.sendMessage(0, halo);
		}

		if(operation.type == 17 && this.stateStatus.salam == 1 && isAdminOrBot(operation.param2)) {//ada yang join
		    let halobos = new Message();
			halobos.to = operation.param1;
			halobos.toType = 2;
			halobos.text = "Welcome Bro\n";
			this._client.sendMessage(0, halobos);
		}else if(operation.type == 17 && this.stateStatus.salam == 1){//ada yang join
			let seq = new Message();
			seq.to = operation.param1;
			//halo.siapa = operation.param2;
			this.textMessage("0101",seq,operation.param2,1);
			//this._client.sendMessage(0, halo);
		}

		if(operation.type == 15 && isAdminOrBot(operation.param2)) {//ada yang leave
		    let babay = new Message();
			babay.to = operation.param1;
			babay.toType = 2;
			babay.text = "#outinpeace\n";
			this._invite(operation.param1,[operation.param2]);
			this._client.sendMessage(0, babay);
		}else if(operation.type == 15 && !isAdminOrBot(operation.param2)){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0102",seq,operation.param2,1);
		}

		if(operation.type == 5 && this.stateStatus.salam == 1) {//someone adding me..
            let halo = new Message();
			halo.to = operation.param1;
			halo.text = "Thanks For Adding Me :)";
			this._client.sendMessage(0, halo);
        }

        if(operation.type == 19 && !isAdminOrBot(operation.param2)) { //ada kick
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick
			let kasihtau = new Message();
			kasihtau.to = operation.param1;
            if(isAdminOrBot(operation.param3)) {
				this.textMessage("0105",kasihtau,operation.param3,1);
                //this._inviteIntoGroup(operation.param1,operation.param3);
				//kasihtau.text = "Jangan kick botku !";
				//this._client.sendMessage(0, kasihtau);
				var kickhim = 'yes';
            }else if(!isAdminOrBot(operation.param3)){
				this.textMessage("0106",kasihtau,operation.param3,1);
				if(!isAdminOrBot(operation.param2)){
					kasihtau.text = "『TERCYDUCK』 ketahuan ya kamu jancok";
				    this._client.sendMessage(0, kasihtau);
				}
				if(this.stateStatus.protect == 1){
					var kickhim = 'yes';
				}
            }
			if(kickhim=='yes'){
				if(!isAdminOrBot(operation.param2)){
				    this._kickMember(operation.param1,[operation.param2]);
				}var kickhim = 'no';
			}

        }

		if(operation.type == 11 && this.stateStatus.protect == 1){//update group (open qr)
		    let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0103",seq,operation.param2,1);
		}else if(operation.type == 11 && this.stateStatus.qr == 1){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0104",seq,operation.param2,1);
		}else if(operation.type == 11 && this.stateStatus.qr == 0){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0103",seq,operation.param2,1);
		}

        if(operation.type == 55){ //ada reader

            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }

        if(operation.type == 13) { // diinvite
            if(this.stateStatus.autojoin == 1 || isAdminOrBot(operation.param2)) {
                return this._acceptGroupInvitation(operation.param1);
            } else {
                return this._cancel(operation.param1,operation.param2);
            }
        }
        this.getOprationType(operation);
    }

	async aLike(){
		if(config.chanToken && config.doing == "no"){
			config.doing = "ya";
		    this._autoLike(config.chanToken,limitposts,komenTL);
		}
	}

  async cancelAll(gid) {
      let { listPendingInvite } = await this.searchGroup(gid);
      for (var i = 0; i < listPendingInvite.length; i++) {
           if(!this.isAdminOrBot(listPendingInvite[i].mid)){
               this._cancel(gid,listPendingInvite);
           }
      }
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

	async matchPeople(param, nama) {//match name
	    for (var i = 0; i < param.length; i++) {
            let orangnya = await this._client.getContacts([param[i]]);
		    if(orangnya[0].displayName == nama){
			    return orangnya;
				break;
		    }
        }
	}

	async isInGroup(param, mid) {
		let { listMember } = await this.searchGroup(param);
	    for (var i = 0; i < listMember.length; i++) {
		    if(listMember[i].mid == mid){
			    return listMember[i].mid;
				break;
		    }
        }
	}

	async isItFriend(mid){
		let listFriends = await this._getAllContactIds();let friend = "no";
		for(var i = 0; i < listFriends.length; i++){
			if(listFriends[i] == mid){
				friend = "ya";break;
			}
		}
		return friend;
	}


	async searchRoom(rid) {
        let thisroom = await this._getRoom(rid);
        let listMemberr = thisroom.contacts.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return {
            listMemberr
        }
    }

    setState(seq,param) {
		if(param == 1){
			let isinya = "Setting\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" ➞ 𝙊𝙉\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" ➞ 𝙊𝙁𝙁\n";
					}
                }
            }this._sendMessage(seq,isinya);
		}else{
        if(isAdminOrBot(seq.from_)){
            let [ actions , status ] = seq.text.split(' ');
            const action = actions.toLowerCase();
            const state = status.toLowerCase() == 'on' ? 1 : 0;
            this.stateStatus[action] = state;
			let isinya = "Setting\n";
			for (var k in this.stateStatus){
                if (typeof this.stateStatus[k] !== 'function') {
					if(this.stateStatus[k]==1){
						isinya += " "+firstToUpperCase(k)+" ➞ 𝙊𝙉\n";
					}else{
						isinya += " "+firstToUpperCase(k)+" ➞ 𝙊𝙁𝙁\n";
					}
                }
            }
            //this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
			this._sendMessage(seq,isinya);
        } else {
            this._sendMessage(seq,`Not permitted!`);
        }}
    }

    mention(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        for (var i = 0; i < listMember.length; i++) {
            mentionStrings.push('@'+listMember[i].displayName+'\n');
            mid.push(listMember[i].mid);
        }
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);

        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }

	async tagAlls(seq){
		let { listMember } = await this.searchGroup(seq.to);
			seq.text = "";
			let mentionMemberx = [];
            for (var i = 0; i < listMember.length; i++) {
				if(seq.text == null || typeof seq.text === "undefined" || !seq.text){
					let namanya = listMember[i].dn;
				    let midnya = listMember[i].mid;
				    seq.text += "@"+namanya+" ";
                    let member = [namanya];

                    let tmp = 0;
                    let mentionMember1 = member.map((v,k) => {
                        let z = tmp += v.length + 3;
                        let end = z;
                        let mentionz = `{"S":"0","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					mentionMemberx.push(mentionMember1);
				    //const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
				    //seq.contentMetadata = tag.cmddata;
				    //this._client.sendMessage(0, seq);
				}else{
				    let namanya = listMember[i].dn;
				    let midnya = listMember[i].mid;
					let kata = seq.text.split("");
					let panjang = kata.length;
				    seq.text += "@"+namanya+" \n";
                    let member = [namanya];

                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 3;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					mentionMemberx.push(mentionMember);
				}
			}
			const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMemberx}]}` }}
			seq.contentMetadata = tag.cmddata;
			this._client.sendMessage(0, seq);
	}

	mension(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        mentionStrings.push('@'+listMember.displayName+'\n');
        mid.push(listMember.mid);
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);

        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
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

    removeReaderByGroup(groupID) {
        const groupIndex = this.checkReader.findIndex(v => {
            if(v.group == groupID) {
                return v
            }
        })

        if(groupIndex != -1) {
            this.checkReader.splice(groupIndex,1);
        }
    }

    async textMessage(textMessages, seq, param, lockt) {
        const [ cmd, payload ] = textMessages.split(' ');
		const gTicket = textMessages.split('line://ti/g/');
		const linktxt = textMessages.split('http');
        const txt = textMessages.toLowerCase();
        const messageID = seq.id;
		const cot = txt.split('@');
		const com = txt.split(':');
		const cox = txt.split(' ');

		if(vx[1] == "cekid" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(seq.contentType == 13){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let midnya = seq.contentMetadata.mid;
				let bang = new Message();
				bang.to = seq.to;
				bang.text = midnya;
				this._client.sendMessage(0, bang);
			}else if(txt == "me"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				seq.text = seq.from_.toString();
				this._client.sendMessage(0, seq);
			}else if(cot[1]){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let cekid = new Message();
				cekid.to = seq.to;
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;

				cekid.text = JSON.stringify(pment).replace(/"/g , "");
				this._client.sendMessage(0, cekid);
			}else{
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "Ketik cekid lalu tag orangnya :)";
				this._client.sendMessage(0,bang);
			}
		}
		if(txt == "cekid" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
				this._sendMessage(seq,"Silahkan Tag Orangnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'cekid' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

		if(vx[1] == "kepo" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(seq.contentType == 13){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let midnya = seq.contentMetadata.mid;
				let timeline_post = await this._getHome(midnya,this.config.chanToken);
				let bang = new Message();
				bang.to = seq.to;

				let orangnya = await this._getContacts([midnya]);let vp,xvp;
				if(orangnya[0].videoProfile !== null && orangnya[0].videoProfile !== undefined){
					vp = orangnya[0].videoProfile.tids.mp4;
					xvp = "\nVideo Profile: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"/"+vp;
				}else{xvp='';}
				let ress = timeline_post.result;
				bang.text =
"\nNama: "+orangnya[0].displayName+"\n\
\nID: \n"+orangnya[0].mid+"\n\
\nProfile Picture: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"\n\
\nCover Picture: \nhttp://dl.profile.line-cdn.net/myhome/c/download.nhn?userid="+orangnya[0].mid+"&oid="+ress.homeInfo.objectId+"\n\
"+xvp+"\n\
\nStatus: \n"+orangnya[0].statusMessage+"";
				this._client.sendMessage(0,bang);
			}else if(cot[1]){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				let bang = new Message();
				bang.to = seq.to;
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				let timeline_post = await this._getHome(pment,this.config.chanToken);

				let orangnya = await this._getContacts([pment]);let vp,xvp;
				if(orangnya[0].videoProfile !== null && orangnya[0].videoProfile !== undefined){
					vp = orangnya[0].videoProfile.tids.mp4;
					xvp = "\nVideo Profile: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"/"+vp;
				}else{xvp='';}
				let ress = timeline_post.result;
				bang.text =
"\nNama: "+orangnya[0].displayName+"\n\
\nID: \n"+orangnya[0].mid+"\n\
\nProfile Picture: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"\n\
\nCover Picture: \nhttp://dl.profile.line-cdn.net/myhome/c/download.nhn?userid="+orangnya[0].mid+"&oid="+ress.homeInfo.objectId+"\n\
"+xvp+"\n\
\nStatus: \n"+orangnya[0].statusMessage+"";
				this._client.sendMessage(0,bang);
			}else if(vx[2] == "arg1" && panjang.length > 30 && panjang[0] == "u"){
				let timeline_post = await this._getHome(txt,this.config.chanToken);
				let orangnya = await this._getContacts([txt]);let vp,xvp;
				if(orangnya[0].videoProfile !== null && orangnya[0].videoProfile !== undefined){
					vp = orangnya[0].videoProfile.tids.mp4;
					xvp = "\nVideo Profile: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"/"+vp;
				}else{xvp='';}
				let ress = timeline_post.result;
				seq.text =
"\nNama: "+orangnya[0].displayName+"\n\
\nID: \n"+orangnya[0].mid+"\n\
\nProfile Picture: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"\n\
\nCover Picture: \nhttp://dl.profile.line-cdn.net/myhome/c/download.nhn?userid="+orangnya[0].mid+"&oid="+ress.homeInfo.objectId+"\n\
"+xvp+"\n\
\nStatus: \n"+orangnya[0].statusMessage+"";
vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,seq.text);
			}else{
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "Ketik kepo lalu tag orangnya";
				this._client.sendMessage(0,bang);
			}
		}
		if(txt == "kepo" && !isBanned(banList, seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Silahkan tag orangnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == 'kepo' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

		if(vx[1] == "ban" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(cot[1]){
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				let msg = new Message();msg.to = seq.to;
				if(isBanned(banList,pment)){
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					msg.text = cot[1]+" 「𝙁𝘼𝙄𝙇𝙀𝘿」 Target Telah Masuk Daftar Banlist";
					this._client.sendMessage(0,msg);
				}else{
					msg.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menambahkan Kedaftar Banlist";
					this._client.sendMessage(0, msg);
			        banList.push(pment);
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				}
			}else if(seq.contentType == 13){
				let midnya = seq.contentMetadata.mid;let msg = new Message();msg.to = seq.to;
				if(isBanned(banList,midnya)){
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					msg.text = "「𝙁𝘼𝙄𝙇𝙀𝘿」 Target Telah Masuk Daftar Banlist";
					this._client.sendMessage(0, msg);
				}else{
					msg.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menambahkan Kedaftar Banlist";
					this._client.sendMessage(0, msg);
			        banList.push(midnya);
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				}
			}else if(panjang.length > 30 && panjang[0] == "u"){
				if(isBanned(banList,txt)){
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					this._sendMessage(seq,"「𝙁𝘼𝙄𝙇𝙀𝘿」 Target Telah Masuk Daftar Banlist");
				}else{
					let msg = new Message();msg.to = seq.to;msg.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menambahkan Kedaftar Banlist";
					this._client.sendMessage(0, msg);
			        banList.push(txt);
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				}
			}else{
					this._sendMessage(seq,"Ketika ban lalu tag orangnya");
			}
		}
		if(txt == "ban" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
			    this._sendMessage(seq,"Ban siapa ?");
				vx[2] = "arg1";
				this._sendMessage(seq,"Silahkan tag orangnya");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "ban" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}

		if(vx[1] == "adminutil" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			let M = new Message();M.to = seq.to;
			let xtxt = "";
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(vx[2] == "arg1"){
				switch(txt){
					case 'add':
					    vx[2] = "arg2";vx[3] = txt;
					    this._sendMessage(seq,"Silahkan Tag Orangnya");
					break;
					case 'del':
					    vx[2] = "arg2";vx[3] = txt;xtxt = "「 Admin List 」\n\n";
					    await this._sendMessage(seq,"Pilih admin yang mau dihapus");
						for(var i=0; i < myBot.length; i++){
							let numb = i+1;
							let xcontact = await this._client.getContact(myBot[i]);
							xtxt += numb+"). "+xcontact.displayName+"\n";
						}
						M.text = xtxt;
						this._client.sendMessage(0, M);
					break;
					case 'list':
					    vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						for(var i=0; i < myBot.length; i++){
							let numb = i+1;
							let xcontact = await this._client.getContact(myBot[i]);
							xtxt += numb+"). "+xcontact.displayName+"\n";
						}
						M.text = xtxt;
						this._client.sendMessage(0, M);
					break;
					default:
					    vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
						this._sendMessage(seq,"#CANCELLED");
					break;
				}
			}else if(vx[2] == "arg2" && vx[3] == "add"){
				if(cot[1]){
					let ment = seq.contentMetadata.MENTION;
				    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
					let msg = new Message();msg.to = seq.to;
					if(isAdminOrBot(pment)){
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
						msg.text = "「𝙁𝘼𝙄𝙇𝙀𝘿」 "+cot[1]+" Telah Masuk Daftar Admin";
						this._client.sendMessage(0,msg);
					}else{
						msg.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menambahkan Kedaftar Admin";
						this._client.sendMessage(0, msg);
				        myBot.push(pment);
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					}
				}else if(seq.contentType == 13){
					let midnya = seq.contentMetadata.mid;let msg = new Message();msg.to = seq.to;
					if(isAdminOrBot(midnya)){
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
						msg.text = "「𝙁𝘼𝙄𝙇𝙀𝘿」 Target Telah Masuk Daftar Admin";
						this._client.sendMessage(0, msg);
					}else{
						msg.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menambahkan Kedaftar Admin";
						this._client.sendMessage(0, msg);
				        myBot.push(midnya);
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					}
				}else if(panjang.length > 30 && panjang[0] == "u"){
					if(isAdminOrBot(txt)){
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
						this._sendMessage(seq,"「𝙁𝘼𝙄𝙇𝙀𝘿」 Target Telah Masuk Daftar Banlist");
					}else{
						let msg = new Message();msg.to = seq.to;msg.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menambahkan Kedaftar Banlist";
						this._client.sendMessage(0, msg);
				        myBot.push(txt);
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					}
				}
			}else if(vx[2] == "arg2" && vx[3] == "del"){
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				let ment = txt-1;
				if (ment > myBot.length) {
               	    myBot.splice(ment, 1);
					this._sendMessage(seq,"Berhasil !");
                }else{
					this._sendMessage(seq,"Admin tidak ada !");
				}
			}
		}
		if(txt == "adminutil" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
				vx[2] = "arg1";
				this._sendMessage(seq,"「 Administrator Utility 」\n\n- Add admin = add\n- Delete admin = del\n- List admin = list");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "adminutil" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}

		if(vx[1] == "unban" && seq.from_ == vx[0] && waitMsg == "yes"){
			let panjang = txt.split("");
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(cot[1]){
				let ment = seq.contentMetadata.MENTION;
			    let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
				let bang = new Message();bang.to = seq.to;
				if(isBanned(banList, pment)){
					let ment = banList.indexOf(pment);
					if (ment > -1) {
                        banList.splice(ment, 1);
                    }
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					bang.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menghapus Dari Daftar Banlist";
					this._client.sendMessage(0,bang);
				}else{
					bang.text = "「𝙁𝘼𝙄𝙇𝙀𝘿」 Target Tidak Masuk Daftar Banlist";
					this._client.sendMessage(0, bang);
				}
			}else if(seq.contentType == 13){
				let midnya = seq.contentMetadata.mid;let bang = new Message();bang.to = seq.to;
				if(isBanned(banList, midnya)){
					let ment = banList.indexOf(midnya);
					if (ment > -1) {
                        banList.splice(ment, 1);
                    }
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					bang.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menghapus Dari Daftar Banlist";
					this._client.sendMessage(0,bang);
				}else{
					bang.text = "「𝙁𝘼𝙄𝙇𝙀𝘿」 Target Tidak Masuk Daftar Banlist";
					this._client.sendMessage(0, bang);
				}
			}else if(panjang.length > 30 && panjang[0] == "u"){
				let bang = new Message();bang.to = seq.to;
				if(isBanned(banList, txt)){
					let ment = banList.indexOf(txt);
					if (ment > -1) {
                        banList.splice(ment, 1);
                    }
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					bang.text = "「𝙎𝙐𝘾𝘾𝙀𝙎𝙎」 Berhasil Menghapus Dari Daftar Banlist";
					this._client.sendMessage(0,bang);
				}else{
					this._sendMessage(seq,"「𝙁𝘼𝙄𝙇𝙀𝘿」 Target Tidak Masuk Daftar Banlist");
				}
			}else{
				this._sendMessage(seq,"Ketik unban lalu tag orangnya");
			}
		}
		if(txt == "unban" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
				seq.text = "";
				for(var i = 0; i < banList.length; i++){
					let orangnya = await this._getContacts([banList[i]]);
				    seq.text += "\n-["+orangnya[0].mid+"]["+orangnya[0].displayName+"]";
				}
				this._sendMessage(seq,seq.text);
			    this._sendMessage(seq,"unban siapa ?");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "unban" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}

		if(txt == "banlist"){
			seq.text = "[Mid] [Name]\n\n";
			for(var i = 0; i < banList.length; i++){
			    let orangnya = await this._getContacts([banList[i]]);
				seq.text += "["+orangnya[0].mid+"]["+orangnya[0].displayName+"]\n";
			}
			this._sendMessage(seq,seq.text);
		}

		if(txt == "bubar" && isAdminOrBot(seq.from_)){
			this._sendMessage(seq,""+displayName+" Pamit")
			this._client.leaveGroup(0,seq.to);
		}
		
		if(txt == "mute" && isAdminOrBot(seq.from_)){
			this.stateStatus.mute = 1;
			this._sendMessage(seq,"(*´﹃｀*)")
		}

        if(txt == 'opraken' && this.stateStatus.cancel == 1 && isAdminOrBot(seq.from_)) {
        	  let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(!isAdminOrBot(listMember[i].mid)){
                  this.cancelAll(seq.to,[listMember[i].mid]);
                }
            }
        }else if(txt == "opraken" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}

        if(txt == 'absen') {
			let { mid, displayName } = await this._client.getProfile();
            this._sendMessage(seq, ''+displayName+' Hadir');
        }

		if(vx[1] == "grouputil" && seq.from_ == vx[0] && waitMsg == "yes"){
			if(vx[2]=="arg1"){
			let M = new Message();
			let listGroups = await this._client.getGroupIdsJoined();
			let xtxt = "「 Group List 」\n\n";
			switch(txt){
				case 'list':
				    vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";groupList = [];
					M.to = seq.to;
					listGroups.forEach(function(item, index, array) {
					  groupList.push(item);
					});
					for(var i = 0; i < groupList.length; i++){
						let numb = i + 1;
						let groupInfo = await this._client.getGroup(groupList[i]);
						let gname = groupInfo.name;
						let memberCount = groupInfo.members.length;
						xtxt += numb+"). "+gname+" ("+memberCount+")\n";
					}
					M.text = xtxt;
					this._client.sendMessage(0, M);
				break;
				case 'ticket':
				    vx[2] = "arg2";vx[3] = "ticket";M.to = seq.to;groupList = [];
					M.text = "Pilih nomor group dibawah ini !";
					await this._client.sendMessage(0, M);
					listGroups.forEach(function(item, index, array) {
					  groupList.push(item);
					});
					for(var i = 0; i < groupList.length; i++){
						let numb = i + 1;
						let groupInfo = await this._client.getGroup(groupList[i]);
						let gname = groupInfo.name;
						let memberCount = groupInfo.members.length;
						xtxt += numb+"). "+gname+" ("+memberCount+")\n";
					}
					M.text = xtxt;
					this._client.sendMessage(0, M);
				break;
				default:
				 vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				 this._sendMessage(seq,"#CANCELLED");
			}}else if(vx[2] == "arg2" && vx[3] == "ticket"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				if(typeof groupList[txt - 1] !== 'undefined') {
					let updateGroup = await this._getGroup(groupList[txt - 1]);
					if(updateGroup.preventJoinByTicket === true) {
					   updateGroup.preventJoinByTicket = false;
					   await this._updateGroup(updateGroup);
					}
					const groupUrl = await this._reissueGroupTicket(groupList[txt - 1]);
					this._sendMessage(seq,"Line Group -> line://ti/g/"+groupUrl);
				}else{this._sendMessage(seq,"Group tidak ada !");}
			}
		}
		if(txt == "grouputil" && isAdminOrBot(seq.from_)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
				waitMsg = "yes";
			    vx[0] = seq.from_;vx[1] = txt;
			    this._sendMessage(seq,"「 Group Utility 」\n- Grouplist = list\n- Group Ticket = ticket\n");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "grouputil" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}

		if(txt == "vykhodi" && seq.toType == 2 && !isBanned(banList, seq.from_) && this.stateStatus.kick == 1){
			this._sendMessage(seq,"Ok bang !");
			this._kickMember(seq.to,[seq.from_]);
		}else if(txt == 'vykhodi' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}


		if(txt == "refresh" && isAdminOrBot(seq.from_)){
			this._sendMessage(seq, "Clean all message....");
			await this._client.removeAllMessages();
			this._sendMessage(seq, "Done !");
		}

        const sp = ['speed','sp','speed','resp','respon'];
        if(sp.includes(txt) && !isBanned(banList, seq.from_)) {
			const curTime = (Date.now() / 1000);let M = new Message();M.to=seq.to;M.text = '';M.contentType = 1;M.contentPreview = null;M.contentMetadata = null;
			await this._client.sendMessage(0,M);
			const rtime = (Date.now() / 1000);
            const xtime = rtime	- curTime;
            this._sendMessage(seq, xtime+' second');
        }else if(sp.includes(txt) && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

        if(txt == 'speed' && !isBanned(banList, seq.from_)) {
			const curTime = Math.floor(Date.now() / 1000);let M = new Message();M.to=seq.to;M.text = '';M.contentType = 1;M.contentPreview = null;M.contentMetadata = null;
			await this._client.sendMessage(0,M);
			const rtime = Math.floor(Date.now() / 1000);
            const xtime = rtime	- curTime;
            this._sendMessage(seq, xtime+' second');
        }else if(txt == 'speed' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

        /*if(txt === 'kernel') {
            exec('uname -a;ptime;id;whoami',(err, sto) => {
                this._sendMessage(seq, sto);
            })
        }*/

        if(txt === 'opraken' && this.stateStatus.kick == 1 && isAdminOrBot(seq.from_) && seq.toType == 2) {
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(!isAdminOrBot(listMember[i].mid)){
                    this._kickMember(seq.to,[listMember[i].mid])
                }
            }
        }else if(txt === 'opraken' && !isAdminOrBot(seq.from_) && seq.toType == 2){this._sendMessage(seq,"Not permitted !");}

		if(txt == 'help') {
			let botOwner = await this._client.getContacts([myBot[0]]);
            let { mid, displayName } = await this._client.getProfile();
			let key2 = "";
			seq.text = key2 += this.keyhelp;
			this._client.sendMessage(0, seq);
		}

		if(txt == '0101' && lockt == 1) {//Jangan dicoba (gk ada efek)
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(listMember[i].mid==param){
					let namanya = listMember[i].dn;
					seq.text = 'Welcome';
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0,1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
                    let member = [namanya];

                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					//console.info("Salam");
                }
            }
        }

		if(txt == "tagall" && seq.toType == 2 && !isBanned(banList, seq.from_)){
         let { listMember } = await this.searchGroup(seq.to);
         for (var i = 0; i < listMember.length; i++) {
              if(!isAdminOrBot(listMember[i].mid)){
                 this.tagAlls(seq.to,[listMember[i].mid]);
              }
         }
		}else if(txt == 'tagall' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

		if(txt == '0103' && lockt == 1){
			let ax = await this._client.getGroup(seq.to);
			if(ax.preventJoinByTicket === true){}else{ax.preventJoinByTicket = true;await this._client.updateGroup(0, ax);}
		}
		if(txt == '0104' && lockt == 1){
			let ax = await this._client.getGroup(seq.to);
			if(ax.preventJoinByTicket === true){ax.preventJoinByTicket = false;await this._client.updateGroup(0, ax);}else{}
		}

		if(txt == '0102' && lockt == 1) {//Jangan dicoba (gk ada efek)
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(listMember[i].mid==param){
					let namanya = listMember[i].dn;
					seq.text = 'Goodbye ! @'+namanya;
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0,1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
                    let member = [namanya];

                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					//console.info("Salam");
                }
            }
        }

        if(txt == 'setpoint') {
            this._sendMessage(seq, `Setpoint for check reader.`);
            this.removeReaderByGroup(seq.to);
        }

        if(txt == 'clear') {
            this.checkReader = []
            this._sendMessage(seq, `Remove all check reader on memory`);
        }

        if(txt == 'recheck'){
            let rec = await this.recheck(this.checkReader,seq.to);seq.text='';
            const mentions = await this.mention(rec);
            for(var i = 0; i < mentions.length; i++){
				seq.text += '\n=> '+mentions[i].displayName;
			}
            this._client.sendMessage(0,seq);
        }

        if(txt == 'setpoint for check reader .') {
            this.searchReader(seq);
        }

        if(txt == 'clearall') {
            this.checkReader = [];
        }

		if(txt == "kickban" && isAdminOrBot(seq.from_)){
			for(var i = 0; i < banList.length; i++){
				let adaGk = await this.isInGroup(seq.to, banList[i]);
				if(typeof adaGk !== "undefined" && adaGk){
					this._kickMember(seq.to,adaGk);
				}
			}
		}else if(txt == "kickban" && !isAdminOrBot(seq.from_)){this._sendMessage(seq,"Not permitted !");}

		if(txt == "setting"){
			this.setState(seq,1)
		}

        const action = ['autojoin on','autojoin off','cancel on','cancel off','kick on','kick off','salam on','salam off','protect off','protect on','qr on','qr off']
        if(action.includes(txt)) {
            this.setState(seq,0)
        }

        if(txt == 'myid' /*|| txt == 'mid' || txt == 'id'*/) {
            this._sendMessage(seq,"ID Kamu: "+seq.from_);
        }

       /* if(txt == 'speedtest' && isAdminOrBot(seq.from)) {
            exec('speedtest-cli --server 6581',(err, res) => {
                    this._sendMessage(seq,res)
            })
        }*/

		if(txt == 'ginfo' && !isBanned(banList, seq.from_)) {
            let groupInfo = await this._client.getGroup(seq.to);let gqr = 'open';let ticketg = 'line://ti/g/';
			let createdT64 = groupInfo.createdTime.toString().split(" ");
			let createdTime = await this._getServerTime(createdT64[0]);
			let gid = seq.to;
			let gticket = groupInfo.groupPreference.invitationTicket;
			if(!gticket){ticketg = "CLOSED";}else{ticketg += gticket;}
			let gname = groupInfo.name;
			let memberCount = groupInfo.members.length;
			let gcreator = groupInfo.creator.displayName;
			let pendingCount = 0;
			if(groupInfo.invitee !== null){
				//console.info("pendingExist");
				pendingCount = groupInfo.invitee.length;
			}
			let gcover = groupInfo.pictureStatus;
			let qr = groupInfo.preventJoinByTicket;
			if(qr === true){
				gqr = 'close';
			}
			let bang = new Message();
			bang.to = seq.to;

			bang.text = "Group Name:\n"+gname+"\n\
Group ID:\n"+gid+"\n\
Group Creator:\n"+gcreator+"\n\
Group CreatedTime:\n"+createdTime+"\n\
Group Ticket:\n"+ticketg+"\n\
Member: "+memberCount+"\n\
Pending: "+pendingCount+"\n\
QR: "+gqr+"\n\
Group Cover:\nhttp://dl.profile.line.naver.jp/"+gcover;
            this._client.sendMessage(0,bang);
        }else if(txt == 'ginfo' && isBanned(banList, seq.from_)){this._sendMessage(seq,"Not permitted !");}

        const joinByUrl = ['gurl','curl'];
        if(joinByUrl.includes(txt) && txt == "gurl") {
            this._sendMessage(seq,`Updating group ...`);
            let updateGroup = await this._getGroup(seq.to);//console.info(updateGroup);
            if(updateGroup.preventJoinByTicket === true) {
                updateGroup.preventJoinByTicket = false;
				await this._updateGroup(updateGroup);
            }
			const groupUrl = await this._reissueGroupTicket(seq.to)
            this._sendMessage(seq,`Line group = line://ti/g/${groupUrl}`);
        }else if(joinByUrl.includes(txt) && txt == "curl") {
            this._sendMessage(seq,`Updating group ...`);
            let updateGroup = await this._getGroup(seq.to);//console.info(updateGroup);
            if(updateGroup.preventJoinByTicket === false) {
                updateGroup.preventJoinByTicket = true;
				await this._updateGroup(updateGroup);
				seq.text = "Done !";
            }else{seq.text = "Sudah ditutup !";}
            this._sendMessage(seq,seq.text);
        }

		if(txt == "0105" && lockt == 1){
			let aas = new Message();
			aas.to = param;
			let updateGroup = await this._getGroup(seq.to);
            if(updateGroup.preventJoinByTicket === true) {
                updateGroup.preventJoinByTicket = false;
				await this._updateGroup(updateGroup);
            }
			const groupUrl = await this._reissueGroupTicket(seq.to);
			aas.toType = 0;
			aas.text = `!joinline://ti/g/${groupUrl}`;
			this._client.sendMessage(0, aas);
		}

		if(txt == "0106" && lockt == 1){
			let friend = await this.isItFriend(param);
			if(friend == "no"){
				await this._client.findAndAddContactsByMid(0, param);
				this._client.inviteIntoGroup(0,seq.to,[param]);
			}else{this._client.inviteIntoGroup(0,seq.to,[param]);}
		}

		if(gTicket[0] == "join" && isAdminOrBot(seq.from_)){
			let sudah = "no";
			let grp = await this._client.findGroupByTicket(gTicket[1]);
			let lGroup = await this._client.getGroupIdsJoined();
			for(var i = 0; i < lGroup.length; i++){
				if(grp.id == lGroup[i]){
					sudah = "ya";
				}
			}
			if(sudah == "ya"){
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "";
				this._client.sendMessage(0,bang);
			}else if(sudah == "no"){
				await this._acceptGroupInvitationByTicket(grp.id,gTicket[1]);
			}
		}

        /*if(cmd == 'join') {
            const [ ticketId ] = payload.split('g/').splice(-1);
            let { id } = await this._findGroupByTicket(ticketId);
            await this._acceptGroupInvitationByTicket(id,ticketId);
        }*/

        /*if(cmd === 'ip') {
            exec(`curl ipinfo.io/${payload}`,(err, res) => {
                const result = JSON.parse(res);
                if(typeof result.error == 'undefined') {
                    const { org, country, loc, city, region } = result;
                    try {
                        const [latitude, longitude ] = loc.split(',');
                        let location = new Location();
                        Object.assign(location,{
                            title: `Location:`,
                            address: `${org} ${city} [ ${region} ]\n${payload}`,
                            latitude: latitude,
                            longitude: longitude,
                            phone: null
                        })
                        const Obj = {
                            text: 'Location',
                            location : location,
                            contentType: 0,
                        }
                        Object.assign(seq,Obj)
                        this._sendMessage(seq,'Location');
                    } catch (err) {
                        this._sendMessage(seq,'Not Found');
                    }
                } else {
                    this._sendMessage(seq,'Location Not Found , Maybe di dalem goa');
                }
            })
        }*/
    }

}

module.exports = new LINE();