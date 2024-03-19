import * as process from 'process';

export type EnvironmentVariable = { [key: string]: string | undefined };

export type ConfigEnvType = ReturnType<typeof getConfig>;
export type SecretType = ReturnType<typeof getConfig>['secrets'];

const getConfig = (environmentVariables: EnvironmentVariable) => ({
    secrets: {
        secretAccessToken: environmentVariables.JWT_ACCESS_TOKEN_SECRET,
        expireAccessToken: environmentVariables.JWT_ACCESS_TOKEN_EXPIRE,
        secretRefreshToken: environmentVariables.JWT_REFRESH_TOKEN_SECRET,
        expireRefreshToken: environmentVariables.JWT_REFRESH_TOKEN_EXPIRE,
    },
    database: {
        host: environmentVariables.PG_HOST,
        name: environmentVariables.PG_DATABASE,
        user: environmentVariables.PG_USER,
        password: environmentVariables.PG_PASSWORD,
        port: environmentVariables.PG_PORT,
    },
    admin: {
        userName: environmentVariables.USER_NAME,
        password: environmentVariables.PASSWORD,
    },
});

export default () => {
    const environmentVariables = process.env;

    console.log('process.env.ENV =', environmentVariables.NODE_ENV);

    return getConfig(environmentVariables);
};
