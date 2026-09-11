import { Country, State, City } from 'country-state-city';
import type { ComboboxOption } from '@/components/ui/combobox';
import type { StudentAddress } from '../@types';

export function getCountryOptions(): ComboboxOption[] {
  return Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));
}

export function getStateOptions(countryIsoCode: string): ComboboxOption[] {
  return State.getStatesOfCountry(countryIsoCode).map((state) => ({
    value: state.isoCode,
    label: state.name,
  }));
}

export function getCityOptions(countryIsoCode: string, stateIsoCode: string): ComboboxOption[] {
  return City.getCitiesOfState(countryIsoCode, stateIsoCode).map((city) => ({
    value: city.name,
    label: city.name,
  }));
}

export function getCountryNameByCode(isoCode: string): string {
  return Country.getCountryByCode(isoCode)?.name ?? '';
}

export function getStateNameByCode(countryIsoCode: string, stateIsoCode: string): string {
  return State.getStateByCodeAndCountry(stateIsoCode, countryIsoCode)?.name ?? '';
}

function findCountryIsoCodeByName(name: string): string {
  return Country.getAllCountries().find((country) => country.name === name)?.isoCode ?? '';
}

function findStateIsoCodeByName(countryIsoCode: string, name: string): string {
  return (
    State.getStatesOfCountry(countryIsoCode).find((state) => state.name === name)?.isoCode ?? ''
  );
}

export interface AddressFormValues {
  street: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

/** Reverses apiDtoToStudent's stored full names back into the isoCodes the address Comboboxes need. */
export function addressToFormValues(address: StudentAddress | undefined): AddressFormValues {
  const countryIsoCode = address?.country ? findCountryIsoCodeByName(address.country) : '';
  const stateIsoCode =
    countryIsoCode && address?.state ? findStateIsoCodeByName(countryIsoCode, address.state) : '';

  return {
    street: address?.street ?? '',
    country: countryIsoCode,
    state: stateIsoCode,
    city: address?.city ?? '',
    zipCode: address?.zipCode ?? '',
  };
}
