import { EventEmitter } from 'events';
import { SaleModel, SaleStatus } from '@src/models/saleModel';
import { setTimeout } from 'timers';
import { CustomError } from '@src/utils/customError';
import { ERROR_MESSAGES, HttpStatus } from '@src/utils/constant';

const statusChange = new EventEmitter();

export const statusChangeTimes: Record<SaleStatus, number> = {
  [SaleStatus.Registered]: 10000, // 10 segundos
  [SaleStatus.Processing]: 20000, // 20 segundos
} as Record<SaleStatus, number>;

async function changeStatus(saleId: string, status: SaleStatus) {
  try {
    const sale = await SaleModel.findById(saleId);

    if (!sale) {
      throw new CustomError(HttpStatus.BAD_REQUEST, ERROR_MESSAGES.SALE_NOT_FOUND);
    } else {
      const updatedSale = await SaleModel.findByIdAndUpdate(saleId, { $set: { status: status } });
    }
  } catch (error) {
    console.error(`Error updating sale to ${status}:`, error);
  }
}

export function startStatusChangeDelayed(newSaleId: string, newSaleStatus: SaleStatus, delay: number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      performStatusChange(newSaleId, newSaleStatus)
        .then(() => resolve())
        .catch((error) => reject(error));
    }, delay);
  });
}

async function performStatusChange(newSaleId: string, newSaleStatus: SaleStatus) {
  try {
    await changeStatus(newSaleId, newSaleStatus);
  } catch (error) {
    throw error;
  }
}

statusChange.on('changeStatus', changeStatus);

export default statusChange;
