<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Device Motion</title>
    <meta name="viewport" content="width=device-width, minimal-ui">
    <style>
      * {
        margin: 0;
        padding: 0;
        outline: 0 !important;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      html {
        font-size: 0.625em;
      }
      body {
        font-size: 1.6rem;
      }
      body,html {
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      .button {
        top: 50%;
        color: #fff;
        width: 50vw;
        height: 50vw;
        margin: 0 auto;
        font-size: 6vw;
        background: #0d0;
        text-align: center;
        border-radius: 50%;
        position: relative;
        border: 1px solid #070;
        line-height: 50vw;

        -webkit-transform: translateY(-50%);
        -ms-transform: translateY(-50%);
        -o-transform: translateY(-50%);
        transform: translateY(-50%);
      }
      .button:active {
        text-shadow: -2px -2px 2px rgba(150, 150, 150, 1);
        -webkit-box-shadow: -5px -4px 39px -9px rgba(0,0,0,0.75);
        -moz-box-shadow: -5px -4px 39px -9px rgba(0,0,0,0.75);
        box-shadow: -5px -4px 39px -9px rgba(0,0,0,0.75);
      }

      .timer {
        left: 0;
        right: 0;
        bottom: 0;
        padding: 2rem;
        position: fixed;
        font-size: 2rem;
        text-align: center;
      }
    </style>
  </head>
  <body>

    <div class="button">Push'n Shake</div>
    <div class="timer"></div>

    <script src="jquery-2.2.1.min.js"></script>
    <script src="jquery.mobile.custom.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>