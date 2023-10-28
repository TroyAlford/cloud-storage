import env from 'env-var';

export const config = {
	env: env.get('NODE_ENV')
		.default('development')
		.asEnum(['development', 'production', 'test']),
	aws: {
		region: env.get('AWS_REGION').default('us-west-1').asString(),
		accessKeyId: env.get('AWS_ACCESS_KEY_ID').required().asString(),
		secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY').required().asString(),
	},
};
