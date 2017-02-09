<?php

mb_internal_encoding('UTF-8');

$psconfig = [
// password and SID hashing settings
        'sysop' => 'mayhem' // undefined im pretty sure you people can fix this small task
	'password_cost' => 1,
	'sid_length' => 7,
	'sid_cost' => 4,

// database

	'server' => 'localhost',
	'password' => '',
	'prefix' => '',

// CORS requests test

	'cors' => [
		'/^http:\/\/smogon\.com$/' => 'smogon.com_',
		'/^http:\/\/www\.smogon\.com$/' => 'www.smogon.com_',
		'/^http:\/\/logs\.psim\.online$/' => 'logs.psim.online_',
		'/^http:\/\/logs\.psim\.online:8080$/' => 'logs.psim.online_',
		'/^http:\/\/[a-z0-9]+\.psim\.online$/' => '',
		'/^http:\/\/main\.pokemon-world\.online$/' => '',
	],

// key signing for bogus request

	'keys' => [

1 => '
',

	]

];
