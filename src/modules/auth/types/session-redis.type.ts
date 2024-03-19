export type RedisSession = {
    deviceId: string;
    lastActiveDate: Date;
    refreshHash: string;
    userId: string;
};
