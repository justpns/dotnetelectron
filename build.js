var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: 'release/package/DotnetElectron-win32-x64',
    outputDirectory: 'release/installer',
    authors: 'Me',
    exe: 'DotnetElectron.exe'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));