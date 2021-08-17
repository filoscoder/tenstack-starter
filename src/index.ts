import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as errorHandler from '@/middlewares/errorHandler';
import * as express from 'express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';

import config from '@/config';
import routes from '@/routes';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

// API Routes
app.use('/', routes);

// Error Middlewares
app.use(errorHandler.genericErrorHandler);
app.use(errorHandler.notFoundError);

process.stdout.write(`⚙️  Application Environment: ${app.get('env')}\n`);
process.stdout.write('📚 Debug logs are ENABLED\n');

app.listen(config.app.port, () =>
  process.stdout.write(
    `🚀 Server ready at http://localhost:${config.app.port}\n`,
  ),
);

export default app;
