import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig, vars } from 'hardhat/config';

const INFURA_KEY = vars.get('INFURA_KEY');
const MNEMONIC = vars.get('MNEMONIC');
const ETHERSCAN_API_KEY = vars.get('ETHERSCAN_API_KEY');

const config: HardhatUserConfig = {
	solidity: '0.8.19',
	networks: {
		sepolia: {
			url: `https://sepolia.infura.io/v3/${INFURA_KEY}`,
			accounts: {
				mnemonic: MNEMONIC,
			},
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
};

export default config;
