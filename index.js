#!/usr/bin/env node
const { spawnSync } = require('child_process');
let program = require('commander');

program
    .version('0.0.0')
    .command('pack-debug')
    .option('-o, --output <output>', 'The output path')
    .action(function (cmd) {
        let d = new Date();
        let secs = d.getSeconds() + (60 * d.getMinutes()) + (60 * 60 * d.getHours());
        let v = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}.${secs}-debug`;
        console.log('Packing ' + v);
        let x = spawnSync('dotnet', ['pack', `-p:PackageVersion=${v}`, '--output', cmd.output || 'C:\\MyNuget']);
        console.log(`stderr: ${x.stderr}`);
        console.log(`stdout: ${x.stdout}`);
    });
    
program.parse(process.argv);