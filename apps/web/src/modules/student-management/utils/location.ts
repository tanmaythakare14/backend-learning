import { Country, State, City } from 'country-state-city';
import type { ComboboxOption } from '@/components/ui/combobox';
import type { StudentAddress, ZipLookupResult } from '../@types';

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

/** Matches a postal-code lookup's state (by abbreviation, then by full name) against this
 * app's ISO-coded state list. Returns '' if neither matches — caller leaves it for manual pick. */
export function resolveZipLookupStateCode(
  countryIsoCode: string,
  lookup: Pick<ZipLookupResult, 'stateName' | 'stateAbbreviation'>,
): string {
  const byAbbreviation = getStateOptions(countryIsoCode).find(
    (option) => option.value.toLowerCase() === lookup.stateAbbreviation.toLowerCase(),
  );
  return byAbbreviation?.value ?? findStateIsoCodeByName(countryIsoCode, lookup.stateName);
}

/** Matches a postal-code lookup's city name against this app's local city list for that
 * state, case-insensitively. Returns '' if there's no match — caller leaves it for manual pick. */
export function resolveZipLookupCity(
  countryIsoCode: string,
  stateIsoCode: string,
  cityName: string,
): string {
  const match = getCityOptions(countryIsoCode, stateIsoCode).find(
    (option) => option.value.toLowerCase() === cityName.toLowerCase(),
  );
  return match?.value ?? '';
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
