import {Component, OnInit} from '@angular/core';
import {SubscriptionService} from '../services/subscribe/subscription.service';
import {Location, Price, Subscription} from '../model/Subscription';
import {PaymentService} from '../services/payment/payment.service';
import {GeoService} from '../services/geo/geo.service';
import {RecyclingMapService} from '../services/recycling-map/recycling-map.service';
import {filter, flatMap, map, switchMap, tap} from 'rxjs/operators';
import {from} from 'rxjs';
import {MathService} from '../services/math/math.service';

@Component({
    selector: 'app-subscribe',
    templateUrl: './subscribe.page.html',
    styleUrls: ['./subscribe.page.scss'],
})
export class SubscribePage implements OnInit {
    subscription: Subscription;
    price: Price;
    locations: Location[] = [];
    places: any[];
    is_in_search_edit_mode = false;

    constructor(private subscriptionService: SubscriptionService,
                private paymentService: PaymentService,
                private geoApi: GeoService,
                private recyclingMapService: RecyclingMapService,
                private mathService: MathService) {
    }

    ngOnInit() {
        this.places = [];
        this.subscription = this.subscriptionService.create();
        this.recalc();
    }

    public recalc() {
        this.findSammelstellen();
        this.paymentService.calculatePrice(this.subscription);
    }


    public findLocation($event) {
        if (!this.is_in_search_edit_mode) {
            return;
        }
        this.locations = [];
        if ($event.detail.value.trim() === '') {
            return;
        }
        this.geoApi.findLocation($event.detail.value.trim()).subscribe(
            (res) => {
                this.locations = res;
            },
            (err) => {
                console.error(err);
            }
        );
    }

    public removeLocations($event) {
        this.locations = [];
        this.places = [];
    }

    public setIs_in_search_edit_mode(value: boolean) {
        this.is_in_search_edit_mode = value;
    }

    public jumpToLocation(location: Location) {
        // console.log('location', location);
        this.setIs_in_search_edit_mode(false);
        this.locations = [];
        this.subscription.address_canonical = location.address_canonical;
        this.geoApi.identify(location).subscribe((res) => {
                res.filter(r => r.layerBodId === 'ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill')
                    .forEach(r => {
                        this.subscription.gdekt = r.properties.kanton;
                        this.subscription.gdname = r.properties.gemname;
                        this.subscription.gdid = r.id;
                    });
                res.filter(r => r.layerBodId === 'ch.swisstopo-vd.ortschaftenverzeichnis_plz')
                    .forEach(r => {
                        this.subscription.plz4 = '' + r.properties.plz;
                        this.subscription.plzname = r.properties.langtext;
                        //console.log('plzname', this.subscription.plzname);
                        this.subscription.is_address_identified = true;
                    });
            },
            (err) => {
                this.subscription.is_address_identified = false;
            },
            () => {
                this.findSammelstellen();
            }
        );
    }

    private findSammelstellen() {
        const selectedJobs = this.subscription.jobs.filter(j => j.is_selected);
        console.log('selectedJobs', selectedJobs);
        const sammelstellenStats = [];
        this.places = [];
        this.subscription.total_saved_km_per_year = 0;
        this.subscription.total_saved_co2_per_year = 0;
        this.subscription.total_saved_fuel_per_year_in_liter = 0;
        this.subscription.total_saved_fuel_per_year_in_fr = 0;


        this.recyclingMapService.findSammelstellen(this.subscription.plz4).subscribe(
            (sammelstellen) => {
                selectedJobs.forEach(j => {
                    const sammelstelleWithMaterialMatch =
                        sammelstellen.filter(s => s.materials.filter(m => m.id === j.material_id.valueOf()).length > 0);
                    j.sammelstellen = sammelstelleWithMaterialMatch;
                    console.log('sammelstelleWithMaterialMatch', sammelstelleWithMaterialMatch);
                    j.sammelstellen.forEach(s => {
                        const stats = sammelstellenStats.filter(sm => sm.id === s.id);
                        if (stats.length === 0) {
                            const sts = {
                                id: s.id,
                                sammelstelle: s,
                                total_count: 1,
                                material: {},
                                materials: []};
                            sts.material[j.material_id.valueOf()] = 1;
                            sts.materials.push(j.material_id);
                            sammelstellenStats.push(sts);
                        } else {
                            stats.forEach(sts => {
                                sts.total_count += 1;
                                if (!(j.material_id in sts.material)) {
                                    sts.material[j.material_id] = 1;
                                    sts.materials.push(j.material_id);
                                } else {
                                    sts.material[j.material_id] += 1;
                                }
                            });
                        }
                        console.log('stats 1', stats);
                        console.log('sammelstellenStats', sammelstellenStats);
                    });
                });
            },
            (err) => console.error(err),
            () => {
                console.log('stats 2', sammelstellenStats);
                // case one is found for all materials:
                const size = selectedJobs.length;
                console.log('size', size);
                let allMatchingSammelstellen = sammelstellenStats.filter(s => s.total_count === size);
                console.log('allMatchingSammelstellen', allMatchingSammelstellen);
                allMatchingSammelstellen.forEach(s => this.places.push(s));
                allMatchingSammelstellen.forEach(sts => {
                    const to_address = sts.sammelstelle.full_name + ', '
                        + sts.sammelstelle.city.zip + ' ' + sts.sammelstelle.city.name;
                    this.recyclingMapService.calculateRoutes(to_address,
                        this.subscription.address_canonical).subscribe(
                                            (route: any) => {
                                                sts.sammelstelle.distance_in_km = route.route.rawdistance / 1000;
                                                sts.sammelstelle.co2_exhaust_in_kg = sts.sammelstelle.distance_in_km * 0.185;
                                                sts.sammelstelle.match_count = 0;
                                            },
                        (err) => {},
                        () => {
                            this.places = this.places.sort((a, b) => {
                                                                if (a.sammelstelle.distance_in_km > b.sammelstelle.distance_in_km) {
                                                                    return 1;
                                                                }
                                                                if (a.sammelstelle.distance_in_km < b.sammelstelle.distance_in_km) {
                                                                    return -1;
                                                                }
                                                                return 0;
                                                            });
                            if (this.places.length > 0) {
                                this.subscription.total_saved_km_per_year = (52 / this.subscription.interval.repeat_weeks) * 2 * this.places[0].sammelstelle.distance_in_km;
                                this.subscription.total_saved_co2_per_year = (52 / this.subscription.interval.repeat_weeks) * 2 * this.places[0].sammelstelle.co2_exhaust_in_kg;
                                this.subscription.total_saved_fuel_per_year_in_liter = this.subscription.total_saved_km_per_year * (8 / 100);
                                this.subscription.total_saved_fuel_per_year_in_fr = this.subscription.total_saved_fuel_per_year_in_liter * 1.38;
                            }

                        });
                });
            }
        );
        // this.places = [];
        // this.subscription.total_saved_co2_per_year = 0;
        // this.subscription.total_saved_fuel_per_year_in_liter = 0;
        // const materialsMatcher = (materials: []) => {
        //     const jbs = this.subscription.jobs.filter(j => j.is_selected)
        //         .filter(j => materials.find((m: any) => m.id === j.material_id.valueOf()) !== undefined);
        //     return jbs.length > 0;
        // };
        // this.recyclingMapService.findSammelstellen(this.subscription.plz4)
        //     .pipe(switchMap((res: any[]) => from(res)),
        //         filter(res => materialsMatcher(res.materials)))
        //     .subscribe((res: any) => {
        //             this.places.push(res);
        //         },
        //         (err) => console.error(err),
        //         () => {
        //             this.places.forEach(p => {
        //                 this.recyclingMapService.calculateRoutes(p.full_name + ', ' + p.city.zip + ' ' + p.city.name,
        //                     this.subscription.address_canonical)
        //                     .subscribe(
        //                         (route: any) => {
        //                             p.distance_in_km = route.route.rawdistance / 1000;
        //                             p.co2_exhaust_in_kg = p.distance_in_km * 0.185;
        //                             p.match_count = 0;
        //                         },
        //                         (err) => {
        //                             console.error('calculateRoutes', err);
        //                         },
        //                         () => {
        //                             this.places = this.places.sort((a, b) => {
        //                                 if (a.distance_in_km > b.distance_in_km) {
        //                                     return 1;
        //                                 }
        //                                 if (a.distance_in_km < b.distance_in_km) {
        //                                     return -1;
        //                                 }
        //                                 return 0;
        //                             });
        //                             if (this.places.length > 5) {
        //                                 this.places = this.places.slice(0, 5);
        //                             }
        //                             if (this.places.length > 0) {
        //                                 this.subscription.total_saved_km_per_year = (52 / 2) * 2 * this.places[0].distance_in_km;
        //                                 this.subscription.total_saved_co2_per_year = (52 / 2) * 2 * this.places[0].co2_exhaust_in_kg;
        //                                 this.subscription.total_saved_fuel_per_year_in_liter = this.subscription.total_saved_km_per_year * (8 / 100);
        //                                 this.subscription.total_saved_fuel_per_year_in_fr = this.subscription.total_saved_fuel_per_year_in_liter * 1.38;
        //                             }
        //                         }
        //                     );
        //             });
        //             // this.subscription.jobs.filter(j => j.is_selected).filter(j => j.material_id.valueOf() === 99).forEach(j => {
        //             //   this.recyclingMapService.findSammelsackPlaces(this.subscription.plz4, this.subscription.gdekt).subscribe(
        //             //       (res2: any) => {
        //             //         this.places.push(res2.full_name);
        //             //       }
        //             //   );
        //             // });
        //         });

    }

    setWeight(weight) {
        setTimeout(() => {
            this.subscription.estimated_weight_in_kg = weight;
            this.recalc();
        }, 450);
    }

    setWeekday(weekday) {
        setTimeout(() => {
            this.subscription.interval.repeat_weekday_number = weekday;
            //this.recalc();
        }, 450);
    }

    setDayHour(hr) {
        setTimeout(() => {
            this.subscription.interval.repeat_dayhour_number = hr;
            // this.recalc();
        }, 450);
    }

    setRepeatWeeks(w) {
        setTimeout(() => {
            this.subscription.interval.repeat_weeks = w;
            this.recalc();
        }, 450);
    }

}
