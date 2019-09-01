#!/usr/bin/env node
const { spawnSync } = require('child_process');
let program = require('commander');




program
    .command('pack-debug')
    .option('-o, --output <output>', 'The output path')
    //.arguments('<file>')
    //.option('-u, --username <username>', 'The user to authenticate as')
    //.option('-p, --password <password>', 'The user's password')
        .action(function (cmd) {
            let d = new Date();
            let secs = d.getSeconds() + (60 * d.getMinutes()) + (60 * 60 * d.getHours());
            let v = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}.${secs}-debug`;
            let x = spawnSync('dotnet', ['pack', `-p:PackageVersion=${v}`, '--output', cmd.output || 'C:/MyNuget']);
            console.log(`stderr: ${x.stderr}`);
            console.log(`stdout: ${x.stdout}`);
        })
    .parse(process.argv);


//let filter = process.argv.slice(2);
//let libs = [
//    'Cblx.AspNetCore.FileServer.Types',
//    'Cblx.AspNetCore.FileServer',
//    'Cblx.FileStorage'
//];
//libs = filter.length ? filter : libs;
//let d = new Date();
//let secs = d.getSeconds() + (60 * d.getMinutes()) + (60 * 60 * d.getHours());
//let v = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}.${secs}-local`;

//for (let l of libs) {
//    let x = spawnSync('dotnet', ['pack', `-p:PackageVersion=${v}`, '--output', 'C:/MyNuget'], { cwd: l });
//    console.log(`stderr: ${x.stderr}`);
//    console.log(`stdout: ${x.stdout}`);
//}
