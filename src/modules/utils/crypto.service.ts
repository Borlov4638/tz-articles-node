import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
    async hashData(data: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(data, salt);
    }

    async compareHash(data: string, hashedData: string): Promise<boolean> {
        return bcrypt.compare(data, hashedData);
    }
}
