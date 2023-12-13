import { EventEmitter } from 'events';
import { SaleModel, SaleStatus, ISale } from '@src/models/saleModel';

const statusChange = new EventEmitter();

const timeToChangeToRegistered = 10000; // 10 segundos
const timeToChangeToProcessing = 20000; // 20 segundos

async function changeToRegistered(saleId: string) {
  try {
    const sale = await SaleModel.findById(saleId);

    if (!sale) {
      console.error('Sale not found Registered');
    } else {
      const updatedSaleRegistered = await SaleModel.findByIdAndUpdate(saleId, { $set: { status: SaleStatus.Registered } });
      console.log(`Sale ${saleId} status changed to Registered`);

      // Agora, inicie o temporizador para mudança de status para Processing
      setTimeout(() => {
        statusChange.emit('changeToProcessing', saleId);
      }, timeToChangeToProcessing - timeToChangeToRegistered);
    }
  } catch (error) {
    console.error('Error updating sale to Registered:', error);
  }
}

async function changeToProcessing(saleId: string) {
  try {
    const sale = await SaleModel.findById(saleId);

    if (!sale) {
      console.error('Sale not found Processing');
    } else {
      const updatedSaleProcessing = await SaleModel.findByIdAndUpdate(saleId, { $set: { status: SaleStatus.Processing } });
      console.log(`Sale ${saleId} status changed to Processing`);
    }
  } catch (error) {
    console.error('Error updating sale to Processing:', error);
  }
}

export function startStatusChange(newSaleId: string) {
  // Use setTimeout para mudança de status para Registered após um tempo
  setTimeout(() => {
    statusChange.emit('changeToRegistered', newSaleId);
  }, timeToChangeToRegistered);
}

statusChange.on('changeToRegistered', changeToRegistered);
statusChange.on('changeToProcessing', changeToProcessing);

export default statusChange;
