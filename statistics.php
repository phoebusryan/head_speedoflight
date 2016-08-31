<?php
  $Root = dirname(__FILE__).'/json_data/';
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mobile data</title>
  <style>
    td {
      padding: 5px;
    }
    td.rotation {
      background: #fafafa;
    }
    .spacer td {
      background: #eee;
      padding: 10px 5px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <?php
    if(empty(($file = $_GET['file']))) {
      $Files = array_reverse(scandir($Root));
      ?>
      <h1>Statistics</h1>
      <ul>
        <?php $index = 1;foreach($Files as $file) { if(!is_file($Root.$file)) continue;?>
        <li><a href="statistics.php?file=<?php echo $file;?>">File: <?php echo $index;?></a> / <a href="canvas10.php?file=<?php echo $file;?>">Modelization</a></li>
        <?php $index++;}?>
      </ul>
    <?php } else {
      $fh = fopen('json_data/'.$file,"r");
      $Content = fread($fh,filesize('json_data/'.$file));
      fclose($fh);
      $Content = json_decode($Content,1);
      $Timer = $Content['timer'];
    ?>
    <a href="statistics.php">Back to overview</a>
    <table>
      <tr>
        <td colspan="6">Items: <?php echo count($Content['json_data']);?></td>
      </tr>
      <tr>
        <td colspan="6">Time: <?php echo number_format($Timer,3);?> Seconds</td>
      </tr>
      <tr>
        <td colspan="6">&nbsp;</td>
      </tr>
      <?php /*foreach($Content['json_data'] as $key => $data) {?>
      <tr>
        <?php if($key % 10 === 0) {?><tr class="spacer"><td colspan="3">Coordinates</td><td colspan="3">Rotation</td></tr><?php }?>
          <td><?php echo 'X: '.$data['gravity']['x'];?></td>
          <td><?php echo 'Y: '.$data['gravity']['y'];?></td>
          <td><?php echo 'Z: '.$data['gravity']['z'];?></td>
          <td class="rotation"><?php echo 'Alpha: '.$data['rotation']['alpha'];?></td>
          <td class="rotation"><?php echo 'Beta: '.$data['rotation']['beta'];?></td>
          <td class="rotation"><?php echo 'Gamma: '.$data['rotation']['gamma'];?></td>
        <?php }*/?>
      <?php foreach($Content['json_data'] as $key => $data) {?>
      <tr>
        <?php if($key % 10 === 0) {?><tr class="spacer"><td colspan="3">Position</td></tr><?php }?>
          <td><?php echo 'X: '.$data['x'];?></td>
          <td><?php echo 'Y: '.$data['y'];?></td>
          <td><?php echo 'Z: '.$data['z'];?></td>
        <?php }?>
      </tr>
    </table>
    <?php }?>
  </div>
</body>
</html>
