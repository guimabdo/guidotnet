# guidotnet
CLI helpers for dotnet

### Install
```
 npm install @guimabdo/guidotnet@latest -g
```

### Create a nuget package for local debugging 
(ex: MyProject.YYYY.M.D.S-debug.nupkg, output path defaults to C:/MyNuget)
```
 guidotnet pack-debug [-o <folder>]
```

### Create an obfuscated nuget package (with obfuscar)
```
 guidotnet pack-obfuscar -v 1.0.1 -c Release -o C:/MyFolder
```
