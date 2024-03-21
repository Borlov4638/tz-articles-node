import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
}));

describe('CryptoService', () => {
    let cryptoService: CryptoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CryptoService],
        }).compile();

        cryptoService = module.get<CryptoService>(CryptoService);
    });

    describe('hashData', () => {
        it('Should return a hashed version of the data', async () => {
            const data = 'This is some test data to be hashed.';
            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedData');

            const result = await cryptoService.hashData(data);

            expect(result).toEqual('hashedData');
            expect(bcrypt.hash).toHaveBeenCalledWith(data, 'salt');
            expect(typeof result).toEqual('string');
            expect(result.length).not.toEqual(0);
        });

        it('shoud throw error if hashing fails', () => {
            const data = 'Another piece of test data.';
            (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

            expect(cryptoService.hashData(data)).rejects.toThrow('Hash failed');
        });
    });

    describe('compareHash', () => {
        it('return true if data match', async () => {
            const data = 'The same data for comparison.';
            const hash = 'A hashed version of the above text.';

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await cryptoService.compareHash(data, hash);

            expect(bcrypt.compare).toHaveBeenCalledWith(data, hash);
            expect(result).toBeTruthy();
        });

        it('shoud return false if  data do not match', async () => {
            const data = 'Different data for comparison.';
            const hash = 'A hashed version of the first sentence.';

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await cryptoService.compareHash(data, hash);

            expect(result).toBeFalsy();
        });
    });
});
