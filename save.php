<?php

if(empty($_POST['json_data'])) die();
$json_string = json_encode($_POST);


$Root = dirname(__FILE__).'/json_data/';
$MaxAge = 60 * 60 * 24 * 5; 
$Files = array_reverse(scandir($Root));
foreach($Files as $file) { if(!is_file($Root.$file)) continue;
  $arrData = explode('.',$file);
  $time = time()-$arrData[0];

  if($time > $MaxAge)
    unlink($Root.$file);
}

$fh = fopen('json_data/'.time().'.txt',"w");
fwrite($fh, $json_string);
fclose($fh);