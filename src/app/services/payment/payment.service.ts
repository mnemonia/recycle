import { Injectable } from '@angular/core';
import {Price, Subscription} from '../../model/Subscription';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor() { }

  public calculatePrice(subscription: Subscription): Price {
    const price = new Price();
    price.value = 25;
    price.value_per_kg = 0;
    subscription.jobs.forEach(job => {
      price.value += job.price.value;
    });
    return price;
  }
}
