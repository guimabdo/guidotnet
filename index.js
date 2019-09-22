#!/usr/bin/env node
const { spawnSync } = require('child_process');
let program = require('commander');
let fs = require('fs');
let path = require('path');
let obfuscarTemplate = fs.readFileSync(`${__dirname}/obfuscar.xml`).toString();

program.version('0.0.0');

program.command('pack-debug')
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

program.command('pack-obfuscar')
    .option('-o, --output <output>', 'The output path')
    .option('-v, --version <version>', 'Package version')
    .option('-c, --configuration <configuration>', 'Configuration')
    .action(function (cmd) {
        console.log('\n\n=======================');
        console.log('= Starting            =');
        console.log('=======================\n\n');

        //Check if obfuscar is installed
        let x = spawnSync('dotnet', ['tool', 'list', '--global']);
        if (x.stdout.toString().indexOf('obfuscar.globaltool') < 0) {
            console.log('Obfuscar not found...Installing...');
            x = spawnSync('dotnet', ['tool', 'install', '--global', 'Obfuscar.GlobalTool', '--version', '2.2.24']);
            console.log(x.stdout.toString());
            console.log(x.stderr.toString());
        }

        console.log('Building projects... (dotnet publish)');

        let args = ['publish'];
        //if (cmd.output) {
        //    args.push('-o');
        //    args.push(cmd.output);
        //}
        if (cmd.configuration) {
            args.push('-c');
            args.push(cmd.configuration);
        }
        x = spawnSync('dotnet', args);
        if (x.stderr.toString()) {
            console.log(`ERROR: ${x.stderr}`);
            return;
        }

        console.log('Done!\n');

        //no errors building
        //get target .dll  path
        let output = x.stdout.toString();
        let assemblies = output.match(/^.+ -> .+$/gm).map(str => str.trim().split(' -> ').reverse()[0]);

        let publishes = [];
        let lastPack;
        for (let a of assemblies) {
            if (!lastPack) {
                lastPack = { files: [] };
                publishes.push(lastPack);
            }
            if (a.endsWith('\\')) {
                lastPack.path = a;
                lastPack = null;
            } else {
                lastPack.files.push(a);
            }
        }

        //console.log('Publishes:');
        //console.log(publishes);
        console.log('============================================================\n\n');

        for (let p of publishes) {
            console.log('Obfuscating ' + path.dirname(p.path) + '\n');
            let obfuscarContent = obfuscarTemplate
                .replace('{files}',
                    p.files.map(f => `  <Module file="$(InPath)\\${path.basename(f)}" />`).join("\n")
                );

            let generatedObfuscarConfigPath = `${__dirname}/obfuscar-generated.xml`;
            fs.writeFileSync(generatedObfuscarConfigPath, obfuscarContent);
            x = spawnSync('obfuscar.console', [generatedObfuscarConfigPath], { cwd: p.path });
            console.log(`stderr: ${x.stderr}`);
            console.log(`stdout: ${x.stdout}`);

            console.log('--------------------------------------\n\n');
            //console.log(obfuscarContent);
            //<Module file="$(InPath)\{file}" />
        }

        console.log('Packing projects... (dotnet pack)');

        args = ['pack', '--no-build'];
        if (cmd.output) {
            args.push('-o');
            args.push(cmd.output);
        }

        if (cmd.configuration) {
            args.push('-c');
            args.push(cmd.configuration);
        }

        if (cmd.version) {
            args.push(`-p:PackageVersion=${cmd.version}`);
            //args.push(cmd.version);
        }

        x = spawnSync('dotnet', args);
        if (x.stderr.toString()) {
            console.log(`ERROR: ${x.stderr}`);
            return;
        }
        console.log(x.stdout.toString());
        console.log('Done!\n');

        //for (let a of assemblies) {
        //    console.log('Obfuscating ' + a + '\n');
        //    console.log('Creating xml config');
        //    let inPath = path.dirname(a);
        //    let fileName = path.basename(a);
        //    //console.log(inPath);
        //    //console.log(fileName);

        //    let obfuscarContent = obfuscarTemplate
        //        .replace(/\{path\}/gm, inPath)
        //        .replace('{file}', fileName);

        //    let generatedObfuscarConfigPath = `${__dirname}/obfuscar-generated.xml`;
        //    fs.writeFileSync(generatedObfuscarConfigPath, obfuscarContent);
        //    console.log('\nexecuting obfuscar...');
        //    x = spawnSync('obfuscar.console', [generatedObfuscarConfigPath]);
        //    console.log(`stderr: ${x.stderr}`);
        //    console.log(`stdout: ${x.stdout}`);

        //    console.log('--------------------------------------');
        //    console.log('\n\n\n');
        //}
    });

const parsed = program.parse(process.argv);
if (!(parsed.args && parsed.args.length > 0 && (typeof (parsed.args[0] === 'object')))) {
    program.outputHelp();
}