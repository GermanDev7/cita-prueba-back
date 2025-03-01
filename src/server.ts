import app from './app';
import {config} from './config/config';
import {logger} from './middlewares/logger';

const PORT=config.port || 3000;

app.listen(PORT,()=>{
    logger.info(`Servidor corriendo en el puerto ${PORT}`)
})