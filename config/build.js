const fs = require("fs");
const path = require("path");

const VALID_ENVS = {
    production: 'production',
    pre: 'pre',
    dev: 'dev',
};

module.exports = function (context) {
    return new Promise((resolve, reject) => {
        // por defecto producción
        let env = 'production';

        if (VALID_ENVS[process.env.NODE_ENV] !== undefined) {
            console.log('Se ha incluido una variable de entorno');
            env = process.env.NODE_ENV;
        }

        const srcfile = path.join(context.opts.projectRoot, "config", `${env}.js`);
        const destfile = path.join(context.opts.projectRoot, 'www', 'config', 'config.js');

        // ahora sustituimos el archivo correspondiente del env por el de config/config.js
        fs.copyFile(srcfile, destfile, (err) => {
            if (err) {
                return reject(err);
            };
            console.log(`Config for ${env} environment set`);
            resolve();
        });
    });

}
