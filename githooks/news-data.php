<?php
date_default_timezone_set('America/Los_Angeles');
include __DIR__.'/../../pokemon-world.online/news/include.php';

echo json_encode(array(getNewsId(), renderNews()));
