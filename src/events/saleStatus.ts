// //Status da sale
// const timeToChangeToRegistered = 5000; // 1 hora
//       setTimeout(async () => {
//         const updatedSale = await SaleModel.findByIdAndUpdate(newSale.id, { $set: { status: SaleStatus.Registered } });

//         if (!updatedSale) {
//           return next(new CustomError(HttpStatus.NOT_FOUND, ERROR_MESSAGES.SALE_NOT_FOUND));
//         }
//         if (!user) {
//           session.cart.items = [];
//         } else {
//           user.cart.items = [];
//           user.cart.total = 0;

//           await user.save();
//         }

//         const timeToChangeToProcessing = 5000; // 1 hora
//         setTimeout(async () => {
//           await SaleModel.findByIdAndUpdate(newSale.id, { $set: { status: SaleStatus.Processing } });
//         }, timeToChangeToProcessing);
//       }, timeToChangeToRegistered);
