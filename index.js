#!/usr/bin/env node 
const { promisify } = require('util')
const path          = require('path')
const program       = require('commander')
const exec          = promisify(require('child_process').exec)
const fs            = require('fs')
const Os            = require('os')
const prompt        = require('prompt-sync')();


var log = console.log;

const configPath = Os.homedir() + '/.config/'
const configFile = 'gpm'

const configStruct = {
	profiles: {}
}

let config = null; 

program
  .version('1.0.0')
  .name('gpm')
  .description('GIT Profile Manager')

program
	.command('profile')
	.description('current profile')
	.action(async () => {
		let details = await getUserInfo();
		console.log(`\nUsername: %s\nEmail: %s\n`, details.name, details.email);
	});

program
	.command('list')
	.description('List saved profiles')
	.action(async () => {
		let cfg = getConfig();
		let keys = Object.keys(cfg.profiles);
		if (keys.length > 0 ) {
			for (var i in keys) {
				var key = keys[i];
				var row = config.profiles[key];
				log(`${key} - ${row.name}:${row.email}`);
			} 
		} else{
			log('\nNo Profiles Found\n');
		} 
	});

program
	.command('use')
	.argument('<nickname>')
	.description('Set to chosen profile')
	.action(async (nickname) => {

		let cfg = getConfig();
		// check if nickname exists
		if (cfg.profiles.hasOwnProperty(nickname)) {
			
			var profile = cfg.profiles[nickname];
			setUserInfo(profile);
			log(`${nickname} saved successfully!`)
		} else {
			log('Nickname does not exists')
		}

	});

program
	.command('add')
	.argument('<nickname>')
	.description('List saved profiles')
	.action(async (nickname) => {

		let cfg = getConfig();

		// check if nickname exists
		if (!cfg.profiles.hasOwnProperty(nickname)) {
			const name = prompt('Name:');
			const email = prompt('Email:');
			
			cfg.profiles[nickname] = {
				'name' : name,
				'email': email
			}
			saveConfig(cfg);

			log(`${nickname} saved successfully!`)
		} else {
			log('Nickname already exists')
		}

	});

program
	.command('remove')
	.argument('<nickname>')
	.description('remove saved profile by nickname')
	.action(async (nickname) => {

		let cfg = getConfig();

		// check if nickname exists
		if (cfg.profiles.hasOwnProperty(nickname)) {
			
			delete cfg.profiles[nickname]
			saveConfig(cfg);

			log(`${nickname} removed!`)
		} else {
			log(`${nickname} does not exist`)
		}

	});

program.parse(process.argv)


function getConfig() {
	if (config != null) 
		return null;

	var filePath = configPath + configFile
	if (!fs.existsSync(filePath)) {
		saveConfig(configStruct);
	}
	
	if (fs.existsSync(filePath)) {
		var raw = fs.readFileSync(filePath)
		var data = JSON.parse(raw)
		config = data;
		return config
	}
	return null
}

function saveConfig (data) {
	let filePath = configPath + configFile
	let raw = JSON.stringify(data,null, 4);
	fs.writeFileSync(filePath, raw);
	config = data;
	return true;
}

async function getUserInfo() {
	const nameOutput = await exec('git config --global user.name')
	const emailOutput = await exec('git config --global user.email')
	return { 
		name: nameOutput.stdout.trim(), 
		email: emailOutput.stdout.trim()
	}
}

async function setUserInfo(profile) {
	const nameOutput = await exec(`git config --global user.name "${profile.name}"`)
	const emailOutput = await exec(`git config --global user.email "${profile.email}" `)
	return true;
}