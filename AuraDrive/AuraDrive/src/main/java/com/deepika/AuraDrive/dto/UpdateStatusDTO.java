package com.deepika.AuraDrive.dto;

import com.deepika.AuraDrive.entity.constant.RideStatus;
import lombok.Data;

@Data
public class UpdateStatusDTO {
    private RideStatus status;
}
