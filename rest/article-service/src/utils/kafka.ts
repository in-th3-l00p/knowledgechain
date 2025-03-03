import { Kafka, Producer, Consumer } from 'kafkajs';
import logger from './logger';

let kafka: Kafka;
let producer: Producer;
let consumer: Consumer;

export const initializeKafka = async () => {
    try {
        const brokers = process.env.KAFKA_BROKERS?.split(',') || [];
        if (brokers.length === 0) {
            throw new Error('KAFKA_BROKERS environment variable is not set');
        }

        kafka = new Kafka({
            clientId: 'user-service',
            brokers: brokers
        });

        producer = kafka.producer();
        consumer = kafka.consumer({ groupId: 'article-service-group' });

        await producer.connect();
        await consumer.connect();

        logger.info('Successfully connected to Kafka');
        
        return { producer, consumer };
    } catch (error) {
        logger.error('Failed to connect to Kafka:', error);
        throw error;
    }
};

export const disconnectKafka = async () => {
    try {
        await producer?.disconnect();
        await consumer?.disconnect();
        logger.info('Successfully disconnected from Kafka');
    } catch (error) {
        logger.error('Failed to disconnect from Kafka:', error);
        throw error;
    }
};

export const getProducer = () => producer;
export const getConsumer = () => consumer;
