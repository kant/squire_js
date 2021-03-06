library(squire)
library(jsonlite)

args = commandArgs(trailingOnly=TRUE)
if (length(args) != 1) {
  stop("The only argument is the output directory")
}

countries <- unique(squire::population$country)
names(countries) <- unique(squire::population$iso3c)

out_dir <- args[1]
for (iso3c in names(countries)) {
  pars <- parameters_explicit_SEEIR(
    countries[[iso3c]],
    hosp_bed_capacity = 1, #dummy value
    ICU_bed_capacity = 1  #dummy value
  )

  country_data <- list(
    population = pars$population,
    contactMatrix = pars$mix_mat_set,
    beta = pars$beta
  )

  write_json(
    country_data,
    file.path(out_dir, paste0(iso3c, '.json')),
    matrix='columnmajor',
    digits=NA
  )
}
