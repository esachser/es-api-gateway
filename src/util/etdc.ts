import { Etcd3} from 'etcd3';
import { configuration } from './config';

const ETCD_CLIENT = new Etcd3(configuration.etcdConf);

export default ETCD_CLIENT;