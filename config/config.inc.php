<?php

mb_internal_encoding('UTF-8');

$psconfig = [
        // keep to string " 'sysops' => ['sysop1', 'nom2'], "
	'sysops' => ['zayan''],

// password and SID hashing settings

	'password_cost' => 1,
	'sid_length' => 7,
	'sid_cost' => 4,

// database

	'server' => 'localhost',
	'username' => 'zayan',
	'password' => '00000000',
	'database' => 'zayan_sql',
	'prefix' => 'xmbl_',
	'charset' => 'zayan_crisis',

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
