package com.dekuple.tensiometre

import android.util.Log

sealed class WithingsSdkNotification {

    companion object {
        fun parse(type: Int, parameters: Map<String, String>): WithingsSdkNotification? {
            Log.d("DEKUPLE", "Parsing notification type $type and parameters $parameters")
            return when (Type.values().find { it.id == type }) {
                Type.INSTALLATION_SUCCESS -> InstallationSuccess(
                    parameters["device_id"] ?: return null,
                    parameters["device_model_id"] ?: return null,
                    parameters["authorisation_code"],
                    parameters["external_id"],
                    parameters["advertise_key"],
                )
                Type.INSTALLATION_FAILURE -> InstallationFailure(
                    parameters["device_model_id"] ?: return null,
                    parameters["error_code"] ?: return null,
                    parameters["error_message"] ?: return null,
                    parameters["external_id"],
                )
                Type.ACCOUNT_ERROR -> AccountError(
                    parameters["error_code"] ?: return null,
                    parameters["error_message"] ?: return null,
                )
                Type.INSTALLATION_FROM_SETTINGS_SUCCESS -> InstallationFromSettingsSuccess(
                    parameters["device_id"] ?: return null,
                    parameters["device_model_id"] ?: return null,
                    parameters["advertise_key"],
                )
                Type.INSTALLATION_FROM_SETTINGS_FAILURE -> InstallationFromSettingsFailure(
                    parameters["device_model_id"] ?: return null,
                    parameters["error_code"] ?: return null,
                    parameters["error_message"] ?: return null,
                )
                Type.DEVICE_DISSOCIATION_SUCCESS -> DeviceDissociationSuccess(
                    parameters["device_id"] ?: return null,
                    parameters["device_model_id"] ?: return null,
                    parameters["advertise_key"],
                )
                Type.DEVICE_DISSOCIATION_FAILURE -> DeviceDissociationFailure(
                    parameters["device_id"] ?: return null,
                    parameters["device_model_id"] ?: return null,
                    parameters["error_code"] ?: return null,
                    parameters["error_message"] ?: return null,
                )
                Type.UPDATE_WIFI_SETTINGS_SUCCESS -> UpdateWifiSettingsSuccess(
                    parameters["device_id"] ?: return null,
                    parameters["device_model_id"] ?: return null,
                    parameters["advertise_key"],
                )
                Type.UPDATE_WIFI_SETTINGS_FAILURE -> UpdateWifiSettingsFailure(
                    parameters["device_id"] ?: return null,
                    parameters["device_model_id"] ?: return null,
                    parameters["error_code"] ?: return null,
                    parameters["error_message"] ?: return null,
                )
                Type.DEVICE_SYNCHRONISATION_SUCCESS -> DeviceSynchronisationSuccess(
                    parameters["device_id"] ?: return null,
                    parameters["device_model_id"] ?: return null,
                    parameters["advertise_key"],
                )
                Type.DEVICE_SYNCHRONISATION_FAILURE -> DeviceSynchronisationFailure(
                    parameters["device_id"] ?: return null,
                    parameters["device_model_id"] ?: return null,
                    parameters["error_code"] ?: return null,
                    parameters["error_message"] ?: return null,
                )
                Type.LINK_OUT -> LinkOut(
                    parameters["url"] ?: return null
                )
                Type.SETTINGS_ERROR -> SettingsError(
                    parameters["error_code"] ?: return null,
                    parameters["error_message"] ?: return null,
                )
                null -> Unknown
            }
        }
    }

    class InstallationSuccess(
        val deviceId: String,
        val deviceModelId: String,
        val authorizationCode: String?,
        val externalId: String?,
        val advertiseKey: String?,
    ) : WithingsSdkNotification()

    class InstallationFailure(
        val deviceModelId: String,
        val errorCode: String,
        val errorMessage: String,
        val externalId: String?,
    ) : WithingsSdkNotification()

    class AccountError(
        val errorCode: String,
        val errorMessage: String,
    ) : WithingsSdkNotification()

    class InstallationFromSettingsSuccess(
        val deviceId: String,
        val deviceModelId: String,
        val advertiseKey: String?,
    ) : WithingsSdkNotification()

    class InstallationFromSettingsFailure(
        val deviceModelId: String,
        val errorCode: String,
        val errorMessage: String,
    ) : WithingsSdkNotification()

    class DeviceDissociationSuccess(
        val deviceId: String,
        val deviceModelId: String,
        val advertiseKey: String?,
    ) : WithingsSdkNotification()

    class DeviceDissociationFailure(
        val deviceId: String,
        val deviceModelId: String,
        val errorCode: String,
        val errorMessage: String,
    ) : WithingsSdkNotification()

    class UpdateWifiSettingsSuccess(
        val deviceId: String,
        val deviceModelId: String,
        val advertiseKey: String?,
    ) : WithingsSdkNotification()

    class UpdateWifiSettingsFailure(
        val deviceId: String,
        val deviceModelId: String,
        val errorCode: String,
        val errorMessage: String,
    ) : WithingsSdkNotification()

    class DeviceSynchronisationSuccess(
        val deviceId: String,
        val deviceModelId: String,
        val advertiseKey: String?,
    ) : WithingsSdkNotification()

    class DeviceSynchronisationFailure(
        val deviceId: String,
        val deviceModelId: String,
        val errorCode: String,
        val errorMessage: String,
    ) : WithingsSdkNotification()

    class LinkOut(val url: String) : WithingsSdkNotification()

    class SettingsError(
        val errorCode: String,
        val errorMessage: String,
    ) : WithingsSdkNotification()

    object Unknown : WithingsSdkNotification()

    private enum class Type(val id: Int) {
        INSTALLATION_SUCCESS(1),
        INSTALLATION_FAILURE(2),
        ACCOUNT_ERROR(3),
        INSTALLATION_FROM_SETTINGS_SUCCESS(4),
        INSTALLATION_FROM_SETTINGS_FAILURE(5),
        DEVICE_DISSOCIATION_SUCCESS(6),
        DEVICE_DISSOCIATION_FAILURE(7),
        UPDATE_WIFI_SETTINGS_SUCCESS(8),
        UPDATE_WIFI_SETTINGS_FAILURE(9),
        DEVICE_SYNCHRONISATION_SUCCESS(12),
        DEVICE_SYNCHRONISATION_FAILURE(13),
        LINK_OUT(16),
        SETTINGS_ERROR(17),
    }
}
